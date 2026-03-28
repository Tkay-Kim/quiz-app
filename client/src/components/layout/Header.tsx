import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()

  const navItems = [
    { to: '/', label: '홈' },
    { to: '/questions', label: '문제 관리' },
    { to: '/tags', label: '태그 관리' },
    { to: '/quiz/setup', label: '퀴즈 시작' }
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">퀴즈 메이커</Link>
        <nav className="flex gap-6">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === item.to
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
