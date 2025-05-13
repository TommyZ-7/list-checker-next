'use client'
import { useState } from 'react'
import * as XLSX from 'xlsx'

export default function EventRegistrationPage() {
  const [eventName, setEventName] = useState('')
  const [eventInfo, setEventInfo] = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [isFileLoaded, setIsFileLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setLoading(true)

    if (file) {
      const reader = new FileReader()

      reader.onload = (e) => {
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

            setParticipants(participantList)
            setIsFileLoaded(true)
            setTimeout(() => setLoading(false), 800)
          }
        } catch (error) {
          console.error('ファイル読み込みエラー:', error)
          setLoading(false)
        }
      }

      reader.readAsArrayBuffer(file)
    }
  }

  const handleSubmit = () => {
    setLoading(true)

    // 送信処理のモック（実際のAPI呼び出しはここに実装）
    setTimeout(() => {
      setLoading(false)
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-10 animate-fadeDown">
          イベント登録
        </h1>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-scaleIn">
          <div className="p-8">
            <div className="space-y-6">
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  イベント名
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="イベント名を入力してください"
                />
              </div>

              <div className="animate-fadeIn delay-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  イベント情報
                </label>
                <textarea
                  value={eventInfo}
                  onChange={(e) => setEventInfo(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="イベントの詳細情報を入力してください"
                />
              </div>

              <div className="animate-fadeIn delay-300">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  出席者一覧（Excel）
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          クリックしてファイルを選択
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Excel形式ファイル (.xlsx, .xls)
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>

              {loading && (
                <div className="flex justify-center py-4 animate-fadeIn">
                  <div className="w-8 h-8 border-t-2 border-indigo-500 border-r-2 rounded-full animate-spin"></div>
                </div>
              )}

              {isFileLoaded && !loading && (
                <div className="border border-green-200 rounded-lg p-4 bg-green-50 animate-expandHeight">
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    出席者一覧
                  </h3>
                  <ul className="max-h-60 overflow-y-auto space-y-1">
                    {participants.map((participant, index) => (
                      <li
                        key={index}
                        className={`px-3 py-2 bg-white rounded shadow-sm animate-slideIn`}
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        {participant}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-sm text-green-700">
                    {participants.length}名の出席者が登録されています
                  </div>
                </div>
              )}

              <div className="pt-4 animate-fadeIn delay-500">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  disabled={loading || !isFileLoaded}
                >
                  {loading ? '処理中...' : 'イベントを登録する'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-slideInRight">
            イベントが正常に登録されました！
          </div>
        )}
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
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes expandHeight {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-fadeDown {
          animation: fadeDown 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .animate-expandHeight {
          animation: expandHeight 0.5s ease-out forwards;
          overflow: hidden;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out forwards;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  )
}
