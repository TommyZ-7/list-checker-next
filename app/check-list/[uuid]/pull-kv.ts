'use server'
import { kv } from '@vercel/kv'
import { createClient } from 'redis'

export async function pullRoomDataRedis(uuid: string) {
  const redis = await createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  }).connect()
  try {
    // すべてのキーを取得
    if (!uuid) {
      throw new Error('UUIDが指定されていません')
    }
    const data = await redis.get(uuid)
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
