'use client'
import React, { useState, useEffect, useMemo } from 'react'

// アイコンコンポーネント (Heroicons SVG)
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
)

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6 text-green-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
)

const XCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6 text-red-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
)

const QuestionMarkCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6 text-yellow-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
    />
  </svg>
)

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591"
    />
  </svg>
)

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
    />
  </svg>
)

// 事前読み込み学籍番号リストのサンプル
const initialStudentsData = [
  { id: '2024001', name: '佐藤 一郎', status: '未確認' }, // status: '出席', '欠席', '未確認'
  { id: '2024002', name: '鈴木 花子', status: '未確認' },
  { id: '2024003', name: '高橋 大輔', status: '未確認' },
  { id: '2024004', name: '田中 恵美', status: '未確認' },
  { id: '2024005', name: '渡辺 雄太', status: '未確認' },
]

// メインのAppコンポーネント
function App() {
  const [students, setStudents] = useState(initialStudentsData)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newStudentId, setNewStudentId] = useState('')
  const [newStudentName, setNewStudentName] = useState('') // 新規学生の氏名入力用
  const [darkMode, setDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // 初期ロードアニメーション用

  // ダークモードの切り替え
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // 初期ロードアニメーション
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500) // 0.5秒後にロード完了
    return () => clearTimeout(timer)
  }, [])

  // 学籍番号検索・処理
  const handleSearch = () => {
    if (!searchTerm.trim()) return
    const foundStudent = students.find(
      (student) => student.id === searchTerm.trim(),
    )
    if (foundStudent) {
      // リスト内の該当学生をハイライト表示するなどの処理 (オプション)
      console.log('学生が見つかりました:', foundStudent)
      // 例えば、該当学生の項目までスクロールする
      const element = document.getElementById(`student-${foundStudent.id}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // 一時的なハイライト
        element.classList.add(
          'ring-2',
          'ring-blue-500',
          'dark:ring-blue-400',
          'transition-all',
          'duration-300',
        )
        setTimeout(() => {
          element.classList.remove(
            'ring-2',
            'ring-blue-500',
            'dark:ring-blue-400',
          )
        }, 2000)
      }
    } else {
      setNewStudentId(searchTerm.trim())
      setShowModal(true)
    }
    setSearchTerm('') // 検索後に入力欄をクリア
  }

  // 出席状況の変更
  const toggleAttendance = (id: string, newStatus: any) => {
    setStudents(
      students.map((student) =>
        student.id === id ? { ...student, status: newStatus } : student,
      ),
    )
  }

  // 新規学生の追加
  const addStudent = () => {
    if (!newStudentId.trim()) return // 学籍番号は必須
    setStudents([
      {
        id: newStudentId,
        name: newStudentName.trim() || `学生 ${newStudentId.slice(-3)}`,
        status: '出席',
      },
      ...students,
    ])
    setShowModal(false)
    setNewStudentId('')
    setNewStudentName('') // 氏名入力欄もクリア
  }

  // 表示する学生リスト (検索機能は実装していないが、フィルタリングするならここ)
  const filteredStudents = useMemo(() => {
    // 現状は全学生を表示。検索語によるフィルタリングもここに追加可能
    return students
  }, [students])

  // 出席状況のサマリー
  const attendanceSummary = useMemo(() => {
    const attended = students.filter((s) => s.status === '出席').length
    const absent = students.filter((s) => s.status === '欠席').length
    const unknown = students.filter((s) => s.status === '未確認').length
    return { attended, absent, unknown, total: students.length }
  }, [students])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="animate-ping h-12 w-12 rounded-full bg-blue-500"></div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-500 font-sans ${isLoading ? 'opacity-0' : 'opacity-100 animate-fadeIn'}`}
    >
      {/* ヘッダー */}
      <header className="bg-white dark:bg-slate-800 shadow-lg sticky top-0 z-50 animate-fadeInDown animation-delay-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            出席管理システム
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={
              darkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'
            }
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 学籍番号入力 */}
        <section className="mb-10 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl animate-fadeInUp animation-delay-200">
          <h2 className="text-2xl font-semibold mb-6 text-center text-slate-700 dark:text-slate-200">
            学籍番号で検索または登録
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="学籍番号を入力..."
              className="flex-grow w-full px-5 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg outline-none"
            />
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              確認
            </button>
          </div>
        </section>

        {/* 出席状況サマリー */}
        <section className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeInUp animation-delay-300">
          <SummaryCard
            title="出席"
            count={attendanceSummary.attended}
            total={attendanceSummary.total}
            color="green"
          />
          <SummaryCard
            title="欠席"
            count={attendanceSummary.absent}
            total={attendanceSummary.total}
            color="red"
          />
          <SummaryCard
            title="未確認"
            count={attendanceSummary.unknown}
            total={attendanceSummary.total}
            color="yellow"
          />
          <SummaryCard
            title="総数"
            count={attendanceSummary.total}
            total={attendanceSummary.total}
            color="blue"
            isTotal={true}
          />
        </section>

        {/* 学生リスト */}
        <section className="animate-fadeInUp animation-delay-400">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700 dark:text-slate-200">
            学生リスト
          </h2>
          {filteredStudents.length > 0 ? (
            <div className="space-y-4">
              {filteredStudents.map((student, index) => (
                <StudentItem
                  key={student.id}
                  student={student}
                  toggleAttendance={toggleAttendance}
                  style={{ animationDelay: `${index * 50}ms` }} // リストアイテムのアニメーション遅延
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-lg">
              表示する学生がいません。
            </p>
          )}
        </section>
      </main>

      {/* 新規学生追加モーダル */}
      {showModal && (
        <AddStudentModal
          newStudentId={newStudentId}
          newStudentName={newStudentName}
          setNewStudentName={setNewStudentName}
          addStudent={addStudent}
          setShowModal={setShowModal}
        />
      )}

      {/* Tailwind CSSのカスタムアニメーション遅延用スタイル (グローバルCSSや<style>タグで定義) */}
      {/*
      <style jsx global>{`
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        // ... 必要に応じて追加
      `}</style>
      */}
      {/* 上記のstyle jsx globalはNext.jsの記法です。通常のReactプロジェクトでは、
          tailwind.config.jsのtheme.extend.animationに遅延バリエーションを追加するか、
          インラインスタイルでanimationDelayを設定します(StudentItemではインラインスタイルを使用)。
          ここではCSSファイルで以下のように定義することを推奨します:
          .animate-fadeInDown.animation-delay-100 { animation-delay: 100ms; }
          など。
      */}
    </div>
  )
}

// 出席状況サマリーカードコンポーネント
interface SummaryCardProps {
  title: string
  count: number
  total: number
  color: string
  isTotal?: boolean
}

function SummaryCard({
  title,
  count,
  total,
  color,
  isTotal = false,
}: SummaryCardProps & { color: keyof typeof colorClasses }) {
  const percentage =
    total > 0 && !isTotal ? ((count / total) * 100).toFixed(1) : null
  const colorClasses = {
    green: 'bg-green-500 dark:bg-green-600',
    red: 'bg-red-500 dark:bg-red-600',
    yellow: 'bg-yellow-500 dark:bg-yellow-600',
    blue: 'bg-blue-500 dark:bg-blue-600',
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">
          {title}
        </h3>
        {/* アイコンをここに追加しても良い */}
      </div>
      <p
        className={`text-4xl font-bold ${color ? `text-${color}-600 dark:text-${color}-400` : 'text-slate-800 dark:text-slate-100'}`}
      >
        {count}
      </p>
      {!isTotal && total > 0 && (
        <div className="mt-2">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div
              className={`${colorClasses[color as keyof typeof colorClasses]} h-2.5 rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
            {percentage}% ({count}/{total})
          </p>
        </div>
      )}
      {isTotal && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          登録総数
        </p>
      )}
    </div>
  )
}

// 学生リストアイテムコンポーネント
function StudentItem({
  student,
  toggleAttendance,
  style,
}: {
  student: { id: string; name: string; status: string }
  toggleAttendance: (id: string, newStatus: string) => void
  style?: React.CSSProperties
}) {
  const statusConfig = {
    出席: {
      icon: <CheckCircleIcon />,
      color: 'green',
      text: '出席',
      buttonClass:
        'bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-600',
    },
    欠席: {
      icon: <XCircleIcon />,
      color: 'red',
      text: '欠席',
      buttonClass:
        'bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-600',
    },
    未確認: {
      icon: <QuestionMarkCircleIcon />,
      color: 'yellow',
      text: '未確認',
      buttonClass:
        'bg-yellow-100 dark:bg-yellow-700 text-yellow-700 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-600',
    },
  }

  const currentStatusConfig =
    statusConfig[student.status as keyof typeof statusConfig]

  return (
    <div
      id={`student-${student.id}`}
      className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1 animate-fadeInUp"
      style={style} // アニメーション遅延用
    >
      <div className="flex items-center">
        <div
          className={`mr-4 p-2 rounded-full bg-${currentStatusConfig.color}-100 dark:bg-${currentStatusConfig.color}-700 hidden sm:block`}
        >
          {currentStatusConfig.icon}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {student.name}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ID: {student.id}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3 sm:mt-0">
        {Object.keys(statusConfig).map((statusKey) => (
          <button
            key={statusKey}
            onClick={() => toggleAttendance(student.id, statusKey)}
            disabled={student.status === statusKey}
            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800
              ${
                student.status === statusKey
                  ? `${statusConfig[statusKey as keyof typeof statusConfig].buttonClass} ring-2 ring-${statusConfig[statusKey as keyof typeof statusConfig].color}-500 dark:ring-${statusConfig[statusKey as keyof typeof statusConfig].color}-400 cursor-default`
                  : `bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 focus:ring-slate-400`
              }`}
          >
            {statusConfig[statusKey as keyof typeof statusConfig].text}
          </button>
        ))}
      </div>
    </div>
  )
}

// 新規学生追加モーダルコンポーネント
function AddStudentModal({
  newStudentId,
  newStudentName,
  setNewStudentName,
  addStudent,
  setShowModal,
}: {
  newStudentId: string
  newStudentName: string
  setNewStudentName: React.Dispatch<React.SetStateAction<string>>
  addStudent: () => void
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-scaleUp">
        <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
          新規学生登録
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          学籍番号「
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {newStudentId}
          </span>
          」は未登録です。 リストに追加しますか？
        </p>
        <div className="mb-6">
          <label
            htmlFor="newStudentName"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            氏名 (任意)
          </label>
          <input
            type="text"
            id="newStudentName"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            placeholder="例: 山田 太郎"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-shadow duration-300 shadow-sm hover:shadow-md focus:shadow-lg outline-none"
          />
        </div>
        <div className="flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={addStudent}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            追加して出席にする
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
