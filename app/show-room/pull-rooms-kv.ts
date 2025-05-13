'use server'
import { kv } from '@vercel/kv'
import { createClient } from 'redis'

export async function pullRedis() {
  const redis = await createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  }).connect()
  try {
    // すべてのキーを取得

    const allKeys = await redis.keys('*')
    console.log('すべてのキー:', allKeys)

    // すべてのキーとその値を取得
    const allData: { [key: string]: any } = {}
    for (const key of allKeys) {
      // キーのタイプを確認
      const type = await redis.type(key)

      switch (type) {
        case 'string':
          allData[key] = await redis.get(key)
          break
        case 'hash':
          allData[key] = await redis.hGetAll(key)
          break
        case 'list':
          allData[key] = await redis.lRange(key, 0, -1)
          break
        case 'set':
          allData[key] = await redis.sMembers(key)
          break
        case 'zset':
          allData[key] = await redis.zRangeWithScores(key, 0, -1, {
            REV: true,
          })
          break
        default:
          allData[key] = `未サポートのタイプ: ${type}`
      }
    }

    console.log('すべてのデータ:', allData)
    return allData
  } catch (error) {
    console.error('Redisエラー:', error)
    throw error
  } finally {
    // 接続を閉じる
    await redis.quit()
  }
}
