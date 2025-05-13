'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card'
import { Input, Textarea } from '@heroui/input'
import { Button } from '@heroui/button'
import { useDropzone } from 'react-dropzone'
import { FaUpload } from 'react-icons/fa'
import { Progress } from '@heroui/progress'
import { Alert } from '@heroui/alert'

import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/utility/tailwind_clsx'

export default function EventRegistrationPage() {
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))
  const [loading, setLoading] = useState(false)
  const [participants, setParticipants] = useState<string[]>([])
  const [isFileLoaded, setIsFileLoaded] = useState(false)

  const onDrop = async (files: File[]) => {
    const file = files[0]
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        if (e.target && e.target.result) {
          const data = new Uint8Array(e.target.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })

          // シートの最初の名前を取得;
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          // A列のデータを抽出（ヘッダーなしを;想定）
          const participantList = []
          let rowIndex = 1

          while (true) {
            const cellAddress = 'A' + rowIndex
            const cell = worksheet[cellAddress]

            if (!cell) break

            participantList.push(cell.v)
            rowIndex++
          }
          await sleep(2000)
          setParticipants(participantList)
          setIsFileLoaded(true)
          setLoading(false)
          console.log('参加者リスト:', participantList)
        }
        setTimeout(() => setLoading(false), 10000)
      } catch (error) {
        console.error('ファイル読み込みエラー:', error)
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-10 animate-fadeDown">
          イベント登録
        </h1>
        <Card className="p-6">
          <CardBody>
            <p>イベント名</p>
            <Input
              label="イベント名を入力してください"
              type="text"
              variant="bordered"
            />
            <p>イベント情報</p>
            <Textarea
              label="イベント情報を入力してください"
              variant="bordered"
            />
            <p>出席者一覧（Excel）</p>
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-4 text-center bg-gray-50',
                {
                  'border-blue-500': isDragActive,
                  'border-gray-300': !isDragActive,
                },
              )}
            >
              <input {...getInputProps()} />
              <FaUpload
                className={cn('mx-auto mb-2', {
                  'text-blue-500': isDragActive,
                  'text-gray-400': !isDragActive,
                })}
                size={24}
              />
              <p className="text-gray-500">
                ドラッグ＆ドロップまたはクリックしてファイルをアップロード
              </p>
            </div>
            {loading && (
              <div className="mt-4">
                <Progress
                  isIndeterminate
                  aria-label="Loading..."
                  className="w-full"
                  size="sm"
                />
              </div>
            )}
            <AnimatePresence>
              {isFileLoaded && (
                <>
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Alert
                      color="success"
                      className="bg-green-100 text-green-800 border border-green-300 rounded-lg p-4"
                    >
                      <p className="font-semibold">
                        ファイルが正常に読み込まれました！
                      </p>
                      <p className="text-sm">
                        {participants.length}名の出席者が登録されています
                      </p>
                    </Alert>
                  </motion.div>
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      出席者一覧
                    </h3>
                    <ul className="max-h-60 overflow-y-auto space-y-1">
                      {participants.map((participant, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 bg-white rounded shadow-sm"
                        >
                          {participant}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </CardBody>
          <CardFooter>
            <Button className="bg-blue-500 text-white px-4 py-2 rounded">
              登録
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
