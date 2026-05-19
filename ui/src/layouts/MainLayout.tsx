import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Cpu, Menu } from 'lucide-react'
import { Sidebar, navItems } from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation()
  const { isDarkMode, toggleTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint in Tailwind
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    // Initial check
    checkScreenSize()

    // Listen for window resize events
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Close sidebar when clicking on a link in mobile view
  const handleNavLinkClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  // Check if a path is active
  const isActivePath = (path: string, exact: boolean = false): boolean => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isActivePath={isActivePath}
        onNavLinkClick={handleNavLinkClick}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex items-center px-6">
          {/* Hamburger menu for mobile */}
          {isMobile && (
            <button 
              className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 flex items-center justify-center"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
          )}
          
          <div className="flex items-center">
            <div className="inline-flex items-center" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <div className="mr-2 text-lime-600 dark:text-lime-500" style={{ display: 'inline-flex', alignItems: 'center', height: '24px', lineHeight: '24px' }}>
                {navItems.find(item => isActivePath(item.path, item.exact)) 
                  ? React.cloneElement(navItems.find(item => isActivePath(item.path, item.exact))?.icon as React.ReactElement, { size: 24 }) 
                  : <Cpu size={24} />}
              </div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white" style={{ display: 'inline-block', margin: 0, padding: 0, height: '24px', lineHeight: '24px' }}>
                {navItems.find(item => isActivePath(item.path, item.exact))?.name || 'Spring Batch Dashboard'}
              </h1>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
