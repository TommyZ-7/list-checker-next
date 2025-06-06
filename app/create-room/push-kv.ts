'use server'
import { kv } from '@vercel/kv'
import { createClient } from 'redis'

export async function pushRedis(
  eventName: string,
  eventInfo: string,
  participants: string[],
  operatingMode: number,
) {
  const eventId = crypto.randomUUID()
  const eventData = {
    eventName,
    eventInfo,
    participants,
    operatingMode,
  }
  const oneWeekInSeconds = 7 * 24 * 60 * 60
  const redis = await createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  }).connect()

  await redis.set(eventId, JSON.stringify(eventData), {
    EX: oneWeekInSeconds,
  })
  const dataId = crypto.randomUUID()
  await redis.set(eventId + ':dataid', dataId, {
    EX: 7 * 24 * 60 * 60, // 1週間の有効期限
  })

  await redis.quit()
  return { success: true, eventId }
}
