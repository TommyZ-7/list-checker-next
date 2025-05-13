import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

// ユーティリティ関数を作成
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}
