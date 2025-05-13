'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card'
import { Input, Textarea } from '@heroui/input'
import { Button } from '@heroui/button'
import { FaUpload } from 'react-icons/fa'
import { Progress } from '@heroui/progress'
import { Alert } from '@heroui/alert'

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from '@heroui/table'

import { delRedis } from './delete-rooms-kv'

import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/utility/tailwind_clsx'

import { pullRedis } from './pull-rooms-kv'

export default function EventRegistrationPage() {
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))
  const [uuids, setUuids] = useState<string[]>([])
  const [roomnames, setRoomnames] = useState<string[]>([])
  const [roominfos, setRoomInfos] = useState<string[]>([])
  const [participants, setParticipants] = useState<string[]>([])
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null)

  const handlePullRedis = async () => {
    const data = await pullRedis()
    console.log('Redisから取得したデータ:', data)
    const uuids: string[] = Object.keys(data)
    console.log('UUIDs:', uuids)
    const roomnames: string[] = []
    const roominfos: string[] = []
    const participants: string[] = []
    for (const uuid of uuids) {
      const roomData = JSON.parse(data[uuid])
      roomnames.push(roomData.eventName)
      roominfos.push(roomData.eventInfo)
      participants.push(roomData.participants.join(', '))
    }
    setRoomnames(roomnames)
    setRoomInfos(roominfos)
    setParticipants(participants)
    setUuids(uuids)
  }

  const handleDeleteRedis = async (uuid: string) => {
    const result = await delRedis(uuid)
    console.log('削除結果:', result)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-10 animate-fadeDown">
          イベント管理
        </h1>
        <Card className="p-6">
          <CardBody>
            <Table
              aria-label="Example static collection table"
              color="default"
              selectionMode="single"
              onSelectionChange={(selected) => {
                const selectedRow = Array.isArray(selected)
                  ? selected
                  : Array.from(selected as Set<string>)
                if (selectedRow.length > 0) {
                  setSelectedUuid(selectedRow[0])
                } else {
                  setSelectedUuid(null)
                }
              }}
            >
              <TableHeader>
                <TableColumn>UUID</TableColumn>
                <TableColumn>イベント名</TableColumn>
                <TableColumn>イベント情報</TableColumn>
                <TableColumn>人数</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No data">
                {uuids.map((uuid, index) => (
                  <TableRow key={uuid}>
                    <TableCell className="overflow-clip">{uuid}</TableCell>
                    <TableCell className="overflow-clip">
                      {roomnames[index]}
                    </TableCell>
                    <TableCell className="overflow-clip">
                      {roominfos[index]}
                    </TableCell>
                    <TableCell className="overflow-clip">
                      {participants[index].split(', ').length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
          <CardFooter>
            <Button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onPress={handlePullRedis}
            >
              読み込み
            </Button>
            <Button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onPress={() => {
                handleDeleteRedis(selectedUuid || '')
              }}
            >
              削除
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
