'use client'
import { useState, useEffect, useRef } from 'react'

export default function AttendanceCheckPage() {
  // ダミーデータ：出席予定者
  const [expectedAttendees, setExpectedAttendees] = useState([
    { id: '2023001', name: '山田 太郎', attended: false },
    { id: '2023002', name: '佐藤 花子', attended: false },
    { id: '2023003', name: '鈴木 一郎', attended: false },
    { id: '2023004', name: '高橋 実花', attended: false },
    { id: '2023005', name: '田中 誠', attended: false },
    { id: '2023006', name: '伊藤 めぐみ', attended: false },
    { id: '2023007', name: '渡辺 健太', attended: false },
    { id: '2023008', name: '小林 さくら', attended: false },
    { id: '2023009', name: '加藤 大輔', attended: false },
    { id: '2023010', name: '松本 あおい', attended: false },
    { id: '2023011', name: '井上 拓也', attended: false },
    { id: '2023012', name: '木村 結衣', attended: false },
    { id: '2023013', name: '清水 悠斗', attended: false },
    { id: '2023014', name: '山口 美咲', attended: false },
    { id: '2023015', name: '中村 翔太', attended: false },
  ])

  const [studentId, setStudentId] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('error')
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [attendanceRate, setAttendanceRate] = useState(0)
  const [recentAttendance, setRecentAttendance] = useState<{
    id: string
    name: string
    attended: boolean
  } | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 出席率の計算
    const attendedCount = expectedAttendees.filter(
      (student) => student.attended,
    ).length
    setAttendanceCount(attendedCount)
    setAttendanceRate(
      Math.round((attendedCount / expectedAttendees.length) * 100),
    )

    // フォーカスをテキストボックスに戻す
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [expectedAttendees])

  const handleAttendance = (e: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault()

    if (!studentId.trim()) return

    const student = expectedAttendees.find((s) => s.id === studentId)

    if (student) {
      if (student.attended) {
        // 既に出席している場合
        setAlertType('warning')
        setAlertMessage(`${student.name}さんは既に出席しています`)
      } else {
        // 出席処理
        const updatedAttendees = expectedAttendees.map((s) =>
          s.id === studentId ? { ...s, attended: true } : s,
        )
        setExpectedAttendees(updatedAttendees)

        setAlertType('success')
        setAlertMessage(`${student.name}さんの出席を確認しました`)
        setRecentAttendance(student)

        // アニメーション用に少し遅延させて最新の出席者をリセット
        setTimeout(() => setRecentAttendance(null), 3000)
      }
    } else {
      // 出席予定者リストにいない場合
      setAlertType('error')
      setAlertMessage(`学籍番号 ${studentId} は出席リストにありません`)
    }

    setShowAlert(true)
    setStudentId('')

    // アラートの自動非表示
    setTimeout(() => {
      setShowAlert(false)
    }, 3000)
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-8 animate-fadeDown">
          出席確認システム
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左側：出席入力パネル */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl p-6 mb-6 animate-slideInLeft">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                出席登録
              </h2>

              <div className="mb-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
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

              {/* アラートメッセージ */}
              {showAlert && (
                <div
                  className={`p-4 rounded-md mb-4 animate-fadeIn ${
                    alertType === 'success'
                      ? 'bg-green-100 text-green-800 border-l-4 border-green-500'
                      : alertType === 'warning'
                        ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'
                        : 'bg-red-100 text-red-800 border-l-4 border-red-500'
                  }`}
                >
                  {alertMessage}
                </div>
              )}

              {/* 出席統計 */}
              <div className="bg-indigo-50 rounded-lg p-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-indigo-900">出席状況</h3>
                  <span className="text-sm text-indigo-700">
                    {new Date().toLocaleDateString('ja-JP')}{' '}
                    {new Date().toLocaleTimeString('ja-JP')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">出席者数</p>
                    <p className="text-2xl font-bold text-indigo-800">
                      {attendanceCount}{' '}
                      <span className="text-sm font-normal text-gray-500">
                        / {expectedAttendees.length}人
                      </span>
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">出席率</p>
                    <p className="text-2xl font-bold text-indigo-800">
                      {attendanceRate}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-white p-3 rounded-md shadow-sm">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                      <div
                        style={{ width: `${attendanceRate}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-1000 ease-out"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：出席者リスト */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-xl p-6 animate-slideInRight">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                出席予定者リスト
              </h2>

              <div className="overflow-y-auto max-h-96 pr-2">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        学籍番号
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        氏名
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
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          recentAttendance && recentAttendance.id === student.id
                            ? 'animate-flash bg-green-100'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.id}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.name}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes flash {
          0%,
          100% {
            background-color: rgba(209, 250, 229, 0);
          }
          50% {
            background-color: rgba(209, 250, 229, 1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-fadeDown {
          animation: fadeDown 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .animate-flash {
          animation: flash 1.5s ease-in-out 2;
        }
      `}</style>
    </div>
  )
}
