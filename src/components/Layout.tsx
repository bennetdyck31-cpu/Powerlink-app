import { ReactNode, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cable, Home, TrendingUp, Settings } from 'lucide-react'
import { Button } from './ui/button'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  // Erzwinge Dark Mode permanent
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/performance', label: 'Performance', icon: TrendingUp },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 transition-colors">
      {/* Header - Desktop */}
      <header className="sticky top-0 z-50 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Cable className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent hidden md:block">
              PowerLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? 'default' : 'outline'}
                  className={
                    isActive(item.path) 
                      ? 'bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 border-0 text-white font-semibold' 
                      : 'border-pink-500/50 text-pink-300 hover:bg-pink-500/20 hover:text-pink-200 hover:border-pink-400'
                  }
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-pink-500/30 z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex-1">
              <div
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'text-pink-400 bg-pink-500/20'
                    : 'text-gray-300 hover:text-pink-300 hover:bg-pink-500/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 py-6 mb-16 md:mb-0">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          © 2025 PowerLink. Made with ⚡
        </div>
      </footer>
    </div>
  )
}

export default Layout
