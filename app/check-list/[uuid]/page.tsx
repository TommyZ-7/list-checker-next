'use client'
import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card'
import { useParams, useRouter } from 'next/navigation'
import { CircularProgress } from '@heroui/progress'
import { Skeleton } from '@heroui/react'
import { Switch } from '@heroui/react'
import { Button } from '@heroui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
} from '@heroui/react'

import { pullRoomDataRedis } from './pull-kv'
import { cn } from '@/utility/tailwind_clsx'

import useInterval from '@/hooks/useInterval'

import { pushRedis, pullRedis, checkDataId, pullDataId } from './data-sync'

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591"
    />
  </svg>
)

type Attendee = {
  id: string
  attended: boolean
}

export default function CheckList() {
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

  const [expectedAttendees, setExpectedAttendees] = useState<Attendee[]>([
    { id: 'データ未読み込み', attended: true },
  ])
  const [newAttendee, setNewAttendee] = useState<string>('')
  const [dataFetched, setDataFetched] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')
  const [onTheDay, setOnTheDay] = useState<string[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [dataId, setDataId] = useState<string>('')
  const [isDataUpdated, setIsDataUpdated] = useState(false)

  const { uuid } = useParams<{ uuid: string }>()
  const inputRef = useRef<HTMLInputElement>(null)

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    if (dataFetched) return // データが既に取得されている場合は再度取得しない
    if (uuid) {
      const fetchData = async () => {
        try {
          const data = await pullRoomDataRedis(uuid)
          console.log('取得したデータ:', data)
          if (data) {
            const attendees: Attendee[] = data.participants.map(
              (id: string) => ({
                id,
                attended: false, // 初期状態では未出席
              }),
            )
            setExpectedAttendees(attendees)
            setRoomName(data.eventName)

            const syncData = await pullRedis(uuid)
            console.log('同期データ:', syncData)
            if (syncData) {
              for (const updateAttendeeIndex of syncData.participants) {
                setExpectedAttendees((prev) => {
                  const updated = [...prev]
                  updated[updateAttendeeIndex].attended = true
                  return updated
                })
              }
              setOnTheDay(syncData.onthedays || [])
            }
            setDataId((await checkDataId(uuid)) ?? '') // データIDをチェック
          } else {
            console.error('データが見つかりませんでした。')
          }
        } catch (error) {
          console.error('データ取得エラー:', error)
        }
      }

      fetchData()

      setDataFetched(true) // データ取得完了フラグを立てる
    }
  }, [uuid])

  useInterval(() => {
    if (!autoSync) return // 自動同期がオフの場合は何もしない
    if (!uuid) return // UUIDがない場合は同期しない
    handleDataSync()
  }, 120000)

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const dataCompression = () => {
    // データ圧縮処理をここに実装
    const compressedData = []
    let count = 0
    for (const attendeeIndex of expectedAttendees) {
      if (attendeeIndex.attended) {
        compressedData.push(count)
      }
      count++
    }
    return compressedData
  }

  const handleAttendance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newAttendee.trim()) return // 空の入力は無視

    const attendeeId = newAttendee.trim()
    setNewAttendee('') // 入力フィールドをクリア

    // 既に出席済みか確認
    const existingAttendee = expectedAttendees.find(
      (attendee) => attendee.id === attendeeId,
    )
    if (existingAttendee) {
      if (existingAttendee.attended) {
        alert(`${attendeeId} は既に出席済みです。`)
      } else {
        // 出席登録
        existingAttendee.attended = true
        setExpectedAttendees([...expectedAttendees])
        scrollToElement(attendeeId)
        setSelectedAttendee(attendeeId)
        setDataId(crypto.randomUUID()) // 新しいデータIDを生成
        setIsDataUpdated(true) // データが更新されたフラグを立てる
      }
    } else {
      // 新規参加者として追加
      if (onTheDay.includes(attendeeId)) {
        alert(`${attendeeId} は既に当日参加者に含まれています。`)
      } else {
        setOnTheDay((prev) => [...prev, attendeeId])
        setDataId(crypto.randomUUID()) // 新しいデータIDを生成
        setIsDataUpdated(true) // データが更新されたフラグを立てる
      }
    }

    // 入力フィールドにフォーカスを戻す
    inputRef.current?.focus()
  }

  interface KeyDownEvent extends React.KeyboardEvent<HTMLInputElement> {}

  const handleKeyDown = (e: KeyDownEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAttendance({
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>)
    }
  }

  const handleDataSync = async () => {
    // データ同期処理をここに実装
    console.log('データ同期処理を実行')
    if (isSyncing) {
      console.log('データ同期中です。しばらくお待ちください。')
      return
    }

    const checkResult = await checkDataId(uuid)
    if (checkResult === dataId) {
      console.log('データIDが一致したため同期をスキップしました')
    } else {
      setIsSyncing(true)
      if (isDataUpdated) {
        const sendData = {
          uuid: uuid,
          participants: dataCompression(),
          onthedays: onTheDay,
        }
        const result = await pushRedis(
          uuid,
          sendData.participants,
          sendData.onthedays,
          dataId,
        )

        setDataId((await result).dataid)
      }

      sleep(10000).then(async () => {
        console.log('データ同期完了')
        const updateDatas = await pullRedis(uuid)
        for (const updateAttendeeIndex of updateDatas.participants) {
          setExpectedAttendees((prev) => {
            const updated = [...prev]
            updated[updateAttendeeIndex].attended = true
            return updated
          })
        }
        for (const updateOnTheDay of updateDatas.onthedays) {
          if (!onTheDay.includes(updateOnTheDay)) {
            setOnTheDay((prev) => [...prev, updateOnTheDay])
          }
        }
        const dataidResult = await pullDataId(uuid)
        setDataId(dataidResult ?? '')
        setIsSyncing(false)
      })
    }
  }

  return (
    <div
      className={`min-h-screen bg-slate-100 rounded-lg dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-500 font-sans opacity-100 animate-fadeIn`}
    >
      {/* ヘッダー */}
      <header className="bg-white dark:bg-slate-800 shadow-lg sticky top-0 z-50 animate-fadeInDown animation-delay-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {roomName}
          </h1>
          <Switch
            isSelected={autoSync}
            onValueChange={setAutoSync}
            className="ml-4"
          >
            自動同期
          </Switch>
          {isSyncing ? (
            <CircularProgress
              isIndeterminate
              size="md"
              className="text-blue-600 dark:text-blue-400"
            />
          ) : (
            <button onClick={handleDataSync} className="p-2 rounded-md">
              <SunIcon />
            </button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 学籍番号入力 */}
        <div>
          <Card className="mb-10 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl animate-fadeInUp animation-delay-200 sticky top-40">
            <CardBody>
              <div className="mb-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newAttendee}
                    onChange={(e) => setNewAttendee(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="学籍番号を入力"
                    className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg"
                    autoFocus
                  />
                  <button
                    onClick={() =>
                      handleAttendance({
                        preventDefault: () => {},
                      } as React.FormEvent<HTMLFormElement>)
                    }
                    className="absolute right-2 top-2 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  学籍番号を入力してEnterキーを押すと出席が登録されます
                </p>
              </div>
              {/* 出席状況サマリー */}
              <div className="bg-indigo-50 rounded-lg p-4 mt-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-indigo-900">出席状況</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">出席者数</p>
                    <p className="text-2xl font-bold text-indigo-800 text-center">
                      {
                        expectedAttendees.filter(
                          (attendee) => attendee.attended,
                        ).length
                      }{' '}
                      <span className="text-sm font-normal text-gray-500">
                        / {expectedAttendees.length}人
                      </span>
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">出席率</p>
                    <p className="text-2xl font-bold text-indigo-800 text-center">
                      {Math.round(
                        (expectedAttendees.filter(
                          (attendee) => attendee.attended,
                        ).length /
                          expectedAttendees.length) *
                          100,
                      )}
                      <span className="text-sm font-normal text-gray-500">
                        %
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-white p-3 rounded-md shadow-sm">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                      <div
                        style={{
                          width: `${Math.round(
                            (expectedAttendees.filter(
                              (attendee) => attendee.attended,
                            ).length /
                              expectedAttendees.length) *
                              100,
                          )}%`,
                        }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-1000 ease-out"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 mt-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-emerald-900">その他</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">当日参加</p>
                    <p className="text-2xl font-bold text-emerald-800 text-center">
                      {onTheDay.length}{' '}
                      <span className="text-sm font-normal text-gray-500">
                        人
                      </span>
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">合計数</p>
                    <p className="text-2xl font-bold text-emerald-800 text-center">
                      {expectedAttendees.filter((attendee) => attendee.attended)
                        .length + onTheDay.length}{' '}
                      <span className="text-sm font-normal text-gray-500">
                        人
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex justify-end">
              <Button onPress={onOpen}>こんぱね</Button>
            </CardFooter>
          </Card>
        </div>

        {/* 学生リスト */}
        <div>
          <Card className="h-full min-h-[400px] bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 animate-fadeInUp animation-delay-400">
            <CardBody>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      学籍番号
                    </th>

                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expectedAttendees.map((student, index) => (
                    <tr
                      key={student.id}
                      id={student.id}
                      className={cn(
                        'transition-colors duration-150 animationFlash',
                        {
                          'bg-emerald-100': selectedAttendee === student.id,
                        },
                      )}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.id}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        {student.attended ? (
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-scaleIn">
                            <svg
                              className="mr-1.5 h-4 w-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                            出席
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            <svg
                              className="mr-1.5 h-4 w-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                            未確認
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </div>

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                こんぱね
              </DrawerHeader>
              <DrawerBody>
                <Button
                  color="primary"
                  className="mb-4"
                  onPress={() => {
                    console.log(dataCompression())
                  }}
                >
                  <span>データ圧縮テスト</span>
                </Button>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <p>クライアントデータid: {dataId}</p>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
