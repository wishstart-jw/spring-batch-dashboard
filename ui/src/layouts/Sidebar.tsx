import React from 'react'
import { Link } from 'react-router-dom'
import { Home, List, Play, BarChart3, Activity, Sun, Moon, Cpu, X, XCircle } from 'lucide-react'

export interface NavItem {
  name: string
  path: string
  exact?: boolean
  icon: React.ReactNode
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', exact: true, icon: <Home size={20} /> },
  { name: 'Job Instances', path: '/job-instances', icon: <List size={20} /> },
  { name: 'Job Executions', path: '/job-executions', icon: <Play size={20} /> },
  { name: 'Failed Executions', path: '/job-executions?status=FAILED', icon: <XCircle size={20} /> },
  { name: 'Statistics', path: '/statistics', exact: true, icon: <BarChart3 size={20} /> },
  { name: 'Job Run Summaries', path: '/statistics/job-runs', icon: <Activity size={20} /> }
]

interface SidebarProps {
  isSidebarOpen: boolean
  isMobile: boolean
  isDarkMode: boolean
  toggleTheme: () => void
  isActivePath: (path: string, exact?: boolean) => boolean
  onNavLinkClick: () => void
  onCloseSidebar: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  isMobile,
  isDarkMode,
  toggleTheme,
  isActivePath,
  onNavLinkClick,
  onCloseSidebar
}) => {
  return (
    <div
      className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:relative z-30 h-full w-72 bg-white dark:bg-gray-800 shadow-md
        transition-transform duration-300 ease-in-out
      `}
    >
      <div className="h-16 flex items-center px-3 border-b border-gray-200 dark:border-gray-700">
        <Link to="/" className="flex items-center space-x-2 max-w-full" onClick={onNavLinkClick}>
          <Cpu size={20} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
          <span className="text-lg font-semibold text-primary-600 dark:text-primary-400 whitespace-nowrap overflow-visible">
            Spring Batch Dashboard
          </span>
        </Link>

        {isMobile && (
          <button
            className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            onClick={onCloseSidebar}
          >
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="px-4 mt-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onNavLinkClick}
                className={`flex items-center px-4 py-2 text-sm rounded-md
                  ${
                    isActivePath(item.path, item.exact)
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-full py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <span className="mr-2">{isDarkMode ? <Sun size={16} /> : <Moon size={16} />}</span>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  )
}
