'use server'
import { kv } from '@vercel/kv'
import { createClient } from 'redis'

export async function pushRedis(
  uuid: string,
  participants: string[],
  onthedays: string[],
) {
  const redis = await createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  }).connect()
  try {
    const uuidKey = uuid + ':datas'
    const pushData = {
      participants,
      onthedays,
    }
    const datas = await redis.get(uuidKey)

    if (datas) {
      for (const data of JSON.parse(datas).participants) {
        if (!pushData.participants.includes(data)) {
          pushData.participants.push(data)
        }
      }
      for (const data of JSON.parse(datas).onthedays) {
        if (!pushData.onthedays.includes(data)) {
          pushData.onthedays.push(data)
        }
      }
    }

    await redis.set(uuidKey, JSON.stringify(pushData), {
      EX: 7 * 24 * 60 * 60, // 1週間の有効期限
    })
    return { success: true }
  } catch (error) {
    console.error('Redisエラー:', error)
    throw error
  } finally {
    // 接続を閉じる
    await redis.quit()
  }
}

export async function pullRedis(uuid: string) {
  const redis = await createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  }).connect()
  try {
    if (!uuid) {
      throw new Error('UUIDが指定されていません')
    }
    const uuidKey = uuid + ':datas'
    const data = await redis.get(uuidKey)
    if (!data) {
      throw new Error(`UUID ${uuid} に対応するデータが見つかりません`)
    }
    // データをJSONに変換
    const jsonData = JSON.parse(data)

    console.log('データ:', jsonData)
    return jsonData
  } catch (error) {
    console.error('Redisエラー:', error)
    throw error
  } finally {
    // 接続を閉じる
    await redis.quit()
  }
}
