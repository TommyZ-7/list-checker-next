'use server'
import { kv } from '@vercel/kv'
import { createClient } from 'redis'

export async function delRedis(key: string) {
  const redis = await createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  }).connect()
  try {
    // すべてのキーを取得
    const result = await redis.del(key)
    console.log('削除結果:', result)
    // すべてのキーとその値を取得
    return result
  } catch (error) {
    console.error('Redisエラー:', error)
    throw error
  } finally {
    // 接続を閉じる
    await redis.quit()
  }
}
