import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  Tag,
  Shield,
  Receipt
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'User Management' },
    { path: '/roles', icon: Shield, label: 'Roles' },
    { path: '/categories', icon: Tag, label: 'Categories' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/transactions', icon: ShoppingCart, label: 'Transactions' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1001,
          background: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem',
          display: 'none',
          cursor: 'pointer'
        }}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="navbar-brand">ChicCheckout</h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem' }}>
            Beauty POS System
          </p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ 
          position: 'absolute', 
          bottom: '1rem', 
          left: '1rem', 
          right: '1rem' 
        }}>
          <div style={{ 
            padding: '1rem', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500' }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
              {user?.role?.display_name}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ width: '100%' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'none'
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          
          .mobile-overlay {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}

export default DashboardLayout