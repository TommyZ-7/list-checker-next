'use client'
import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card'
import { useParams, useRouter } from 'next/navigation'
import { CircularProgress } from '@heroui/progress'

import { pullRoomDataRedis } from './pull-kv'
import { cn } from '@/utility/tailwind_clsx'

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
)

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6 text-green-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
)

const XCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6 text-red-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
)

const QuestionMarkCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6 text-yellow-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
    />
  </svg>
)

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

const MoonIcon = () => (
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
      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
    />
  </svg>
)
type Attendee = {
  id: string
  attended: boolean
}

export default function CheckList() {
  const [expectedAttendees, setExpectedAttendees] = useState<Attendee[]>([
    { id: 'データ未読み込み', attended: true },
  ])
  const [newAttendee, setNewAttendee] = useState<string>('')
  const [dataFetched, setDataFetched] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')

  const router = useRouter()
  const { uuid } = useParams<{ uuid: string }>()
  const inputRef = useRef<HTMLInputElement>(null)

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

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
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
      }
    } else {
      // 新規参加者として追加
      const newParticipant: Attendee = { id: attendeeId, attended: true }
      setExpectedAttendees([...expectedAttendees, newParticipant])
      alert(`${attendeeId} が新規参加者として追加され、出席が登録されました。`)
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
          <button>
            <SunIcon />
          </button>
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
                      {
                        expectedAttendees.filter(
                          (attendee) => attendee.attended,
                        ).length
                      }{' '}
                      <span className="text-sm font-normal text-gray-500">
                        人
                      </span>
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">合計参加者数</p>
                    <p className="text-2xl font-bold text-emerald-800 text-center">
                      {
                        expectedAttendees.filter(
                          (attendee) => attendee.attended,
                        ).length
                      }{' '}
                      <span className="text-sm font-normal text-gray-500">
                        人
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 学生リスト */}
        <div>
          <Card className="h-full min-h-[400px] bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 animate-fadeInUp animation-delay-400">
            <CardHeader>
              <h2 className="text-2xl font-semibold mb-6 text-center text-slate-700 dark:text-slate-200">
                学生リスト
              </h2>
            </CardHeader>
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
                        'bg-gray-50 transition-colors duration-150 animationFlash',
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

      {/* 新規学生追加モーダル */}
    </div>
  )
}
