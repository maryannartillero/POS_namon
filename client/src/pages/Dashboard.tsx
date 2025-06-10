import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Eye
} from 'lucide-react'
import { transactionsAPI, productsAPI, usersAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface DashboardStats {
  totalUsers: number
  totalProducts: number
  todaySales: number
  lowStockItems: number
  totalRevenue: number
  totalTransactions: number
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    todaySales: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    totalTransactions: 0
  })

  // Fetch dashboard data
  const { data: salesData, isLoading: salesLoading } = useQuery(
    'daily-sales',
    () => transactionsAPI.getDailySales(),
    { refetchInterval: 30000 } // Refresh every 30 seconds
  )

  const { data: lowStockData, isLoading: stockLoading } = useQuery(
    'low-stock',
    () => productsAPI.getLowStock(),
    { refetchInterval: 60000 } // Refresh every minute
  )

  const { data: usersData, isLoading: usersLoading } = useQuery(
    'users-count',
    () => usersAPI.getAll({ per_page: 1 })
  )

  const { data: productsData, isLoading: productsLoading } = useQuery(
    'products-count',
    () => productsAPI.getAll({ per_page: 1 })
  )

  useEffect(() => {
    // Update stats when data is loaded
    setStats(prev => ({
      ...prev,
      todaySales: salesData?.data?.sales_summary?.total_sales || 0,
      totalRevenue: salesData?.data?.sales_summary?.total_sales || 0,
      totalTransactions: salesData?.data?.sales_summary?.total_transactions || 0,
      lowStockItems: lowStockData?.data?.products?.length || 0,
      totalUsers: usersData?.data?.total || 0,
      totalProducts: productsData?.data?.total || 0
    }))
  }, [salesData, lowStockData, usersData, productsData])

  const isLoading = salesLoading || stockLoading || usersLoading || productsLoading

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'var(--primary-color)',
      bgColor: 'var(--primary-light)'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'var(--secondary-color)',
      bgColor: '#e1bee7'
    },
    {
      title: "Today's Sales",
      value: `₱${stats.todaySales.toLocaleString()}`,
      icon: DollarSign,
      color: 'var(--success-color)',
      bgColor: '#c8e6c9'
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      icon: ShoppingCart,
      color: 'var(--info-color)',
      bgColor: '#bbdefb'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'var(--warning-color)',
      bgColor: '#ffe0b2'
    },
    {
      title: 'Revenue Growth',
      value: '+12.5%',
      icon: TrendingUp,
      color: 'var(--success-color)',
      bgColor: '#c8e6c9'
    }
  ]

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <LoadingSpinner size="lg" />
        <p className="mt-2">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <div className="dashboard-header mb-4">
        <h1>Dashboard</h1>
        <p className="text-muted">Welcome to ChicCheckout Beauty POS System</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid grid-3 mb-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="stat-card card slide-up">
              <div className="card-body">
                <div className="flex-between">
                  <div>
                    <h3 className="stat-value">{stat.value}</h3>
                    <p className="stat-title">{stat.title}</p>
                  </div>
                  <div 
                    className="stat-icon"
                    style={{ 
                      background: stat.bgColor,
                      color: stat.color 
                    }}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions mb-4">
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid-4">
              <button className="btn btn-primary">
                <Users size={16} />
                Add User
              </button>
              <button className="btn btn-secondary">
                <Package size={16} />
                Add Product
              </button>
              <button className="btn btn-success">
                <ShoppingCart size={16} />
                New Transaction
              </button>
              <button className="btn btn-outline">
                <Eye size={16} />
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Low Stock Alerts */}
      <div className="grid-2">
        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <h3>Low Stock Alerts</h3>
            <span className="badge badge-warning">{stats.lowStockItems}</span>
          </div>
          <div className="card-body">
            {stats.lowStockItems > 0 ? (
              <div className="alert alert-warning">
                <AlertTriangle size={16} style={{ marginRight: '0.5rem' }} />
                {stats.lowStockItems} products are running low on stock
              </div>
            ) : (
              <p className="text-muted">All products are well stocked</p>
            )}
          </div>
        </div>

        {/* Today's Summary */}
        <div className="card">
          <div className="card-header">
            <h3>Today's Summary</h3>
          </div>
          <div className="card-body">
            <div className="summary-item">
              <span>Total Sales:</span>
              <strong>₱{stats.todaySales.toLocaleString()}</strong>
            </div>
            <div className="summary-item">
              <span>Transactions:</span>
              <strong>{stats.totalTransactions}</strong>
            </div>
            <div className="summary-item">
              <span>Average Sale:</span>
              <strong>
                ₱{stats.totalTransactions > 0 
                  ? (stats.todaySales / stats.totalTransactions).toLocaleString() 
                  : '0'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .stats-grid {
          gap: 1.5rem;
        }

        .stat-card {
          transition: var(--transition);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: var(--dark-color);
        }

        .stat-title {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-actions .grid-4 {
          gap: 1rem;
        }

        .quick-actions .btn {
          height: 60px;
          flex-direction: column;
          gap: 0.5rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .quick-actions .grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-actions .grid-4 {
            grid-template-columns: 1fr;
          }
          
          .stat-value {
            font-size: 1.5rem;
          }
          
          .stat-icon {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard