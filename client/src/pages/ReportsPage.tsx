import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Calendar, TrendingUp, DollarSign, ShoppingCart, Package, Users, Download, Printer } from 'lucide-react'
import { transactionsAPI, productsAPI, usersAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const ReportsPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [reportType, setReportType] = useState('daily')

  // Fetch daily sales data
  const { data: dailySalesData, isLoading: dailySalesLoading } = useQuery(
    ['daily-sales', dateTo],
    () => transactionsAPI.getDailySales(dateTo),
    { refetchInterval: 30000 }
  )

  // Fetch monthly sales data
  const { data: monthlySalesData, isLoading: monthlySalesLoading } = useQuery(
    ['monthly-sales', new Date().getMonth() + 1, new Date().getFullYear()],
    () => transactionsAPI.getMonthlySales(new Date().getMonth() + 1, new Date().getFullYear())
  )

  // Fetch transactions for period
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery(
    ['transactions-report', dateFrom, dateTo],
    () => transactionsAPI.getAll({ date_from: dateFrom, date_to: dateTo })
  )

  // Fetch low stock products
  const { data: lowStockData, isLoading: lowStockLoading } = useQuery(
    'low-stock-report',
    () => productsAPI.getLowStock()
  )

  // Fetch users count
  const { data: usersData } = useQuery('users-count', () => usersAPI.getAll({ per_page: 1 }))

  const dailySales = dailySalesData?.data?.sales_summary || {}
  const topProducts = dailySalesData?.data?.top_products || []
  const monthlySales = monthlySalesData?.data?.daily_sales || []
  const transactions = transactionsData?.data?.data || []
  const lowStockProducts = lowStockData?.data?.products || []
  const totalUsers = usersData?.data?.total || 0

  // Chart data
  const salesChartData = {
    labels: monthlySales.map((item: any) => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Sales',
        data: monthlySales.map((item: any) => item.sales),
        borderColor: 'var(--primary-color)',
        backgroundColor: 'var(--primary-light)',
        tension: 0.1,
      },
    ],
  }

  const topProductsChartData = {
    labels: topProducts.map((item: any) => item.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: topProducts.map((item: any) => item.total_quantity),
        backgroundColor: [
          'var(--primary-color)',
          'var(--secondary-color)',
          'var(--success-color)',
          'var(--warning-color)',
          'var(--info-color)',
        ],
      },
    ],
  }

  const paymentMethodsData = transactions.reduce((acc: any, transaction: any) => {
    acc[transaction.payment_method] = (acc[transaction.payment_method] || 0) + 1
    return acc
  }, {})

  const paymentMethodsChartData = {
    labels: Object.keys(paymentMethodsData),
    datasets: [
      {
        data: Object.values(paymentMethodsData),
        backgroundColor: [
          'var(--primary-color)',
          'var(--secondary-color)',
          'var(--success-color)',
        ],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const exportReport = () => {
    const reportData = {
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalSales: dailySales.total_sales || 0,
        totalTransactions: dailySales.total_transactions || 0,
        averageSale: dailySales.average_sale || 0,
        totalUsers: totalUsers,
        lowStockItems: lowStockProducts.length,
      },
      topProducts,
      lowStockProducts,
      transactions: transactions.slice(0, 100), // Limit for export
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `sales-report-${dateFrom}-to-${dateTo}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const printReport = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Report - ${dateFrom} to ${dateTo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ChicCheckout Sales Report</h1>
            <p>Period: ${dateFrom} to ${dateTo}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Sales</h3>
              <p style="font-size: 24px; font-weight: bold;">₱${(dailySales.total_sales || 0).toLocaleString()}</p>
            </div>
            <div class="summary-card">
              <h3>Total Transactions</h3>
              <p style="font-size: 24px; font-weight: bold;">${dailySales.total_transactions || 0}</p>
            </div>
            <div class="summary-card">
              <h3>Average Sale</h3>
              <p style="font-size: 24px; font-weight: bold;">₱${(dailySales.average_sale || 0).toLocaleString()}</p>
            </div>
          </div>
          
          <h2>Top Products</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${topProducts.map((product: any) => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.total_quantity}</td>
                  <td>₱${product.total_revenue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>Low Stock Alert</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Current Stock</th>
                <th>Min Level</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockProducts.map((product: any) => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.stock_quantity}</td>
                  <td>${product.min_stock_level}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(reportHTML)
    printWindow.document.close()
    printWindow.print()
  }

  const isLoading = dailySalesLoading || monthlySalesLoading || transactionsLoading || lowStockLoading

  return (
    <div className="reports-page fade-in">
      {/* Header */}
      <div className="page-header flex-between mb-4">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-muted">View sales reports and business analytics</p>
        </div>
        <div className="flex" style={{ gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={exportReport}>
            <Download size={16} />
            Export
          </button>
          <button className="btn btn-primary" onClick={printReport}>
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="filters-section mb-4">
        <div className="card">
          <div className="card-body">
            <div className="grid-3" style={{ gap: '1rem' }}>
              <div>
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="form-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-4">
          <LoadingSpinner size="lg" />
          <p className="mt-2">Loading reports...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-cards grid-4 mb-4">
            <div className="card">
              <div className="card-body text-center">
                <DollarSign size={32} color="var(--success-color)" style={{ marginBottom: '0.5rem' }} />
                <h3>₱{(dailySales.total_sales || 0).toLocaleString()}</h3>
                <p className="text-muted">Today's Sales</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <ShoppingCart size={32} color="var(--primary-color)" style={{ marginBottom: '0.5rem' }} />
                <h3>{dailySales.total_transactions || 0}</h3>
                <p className="text-muted">Transactions</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <TrendingUp size={32} color="var(--info-color)" style={{ marginBottom: '0.5rem' }} />
                <h3>₱{(dailySales.average_sale || 0).toLocaleString()}</h3>
                <p className="text-muted">Average Sale</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <Users size={32} color="var(--secondary-color)" style={{ marginBottom: '0.5rem' }} />
                <h3>{totalUsers}</h3>
                <p className="text-muted">Total Users</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-section grid-2 mb-4">
            <div className="card">
              <div className="card-header">
                <h3>Sales Trend</h3>
              </div>
              <div className="card-body">
                {monthlySales.length > 0 ? (
                  <Line data={salesChartData} options={chartOptions} />
                ) : (
                  <p className="text-center text-muted">No sales data available</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Top Products</h3>
              </div>
              <div className="card-body">
                {topProducts.length > 0 ? (
                  <Bar data={topProductsChartData} options={chartOptions} />
                ) : (
                  <p className="text-center text-muted">No product data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods & Low Stock */}
          <div className="grid-2 mb-4">
            <div className="card">
              <div className="card-header">
                <h3>Payment Methods</h3>
              </div>
              <div className="card-body">
                {Object.keys(paymentMethodsData).length > 0 ? (
                  <Doughnut data={paymentMethodsChartData} options={chartOptions} />
                ) : (
                  <p className="text-center text-muted">No payment data available</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header flex-between">
                <h3>Low Stock Alert</h3>
                <span className="badge badge-warning">{lowStockProducts.length}</span>
              </div>
              <div className="card-body">
                {lowStockProducts.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {lowStockProducts.map((product: any) => (
                      <div key={product.id} className="flex-between p-2 mb-2" style={{ border: '1px solid #eee', borderRadius: '4px' }}>
                        <div>
                          <strong>{product.name}</strong>
                          <br />
                          <small className="text-muted">{product.category.name}</small>
                        </div>
                        <div className="text-right">
                          <span className="badge badge-warning">{product.stock_quantity}</span>
                          <br />
                          <small className="text-muted">Min: {product.min_stock_level}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted">All products are well stocked</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Transactions</h3>
            </div>
            <div className="card-body p-0">
              {transactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Transaction #</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((transaction: any) => (
                        <tr key={transaction.id}>
                          <td><code>{transaction.transaction_number}</code></td>
                          <td>{transaction.customer_name || 'Walk-in'}</td>
                          <td>{transaction.items?.length || 0} item(s)</td>
                          <td><strong>₱{transaction.total_amount.toFixed(2)}</strong></td>
                          <td>{transaction.payment_method}</td>
                          <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted">No transactions found for the selected period</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .summary-cards .card {
          transition: var(--transition);
        }
        
        .summary-cards .card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
        }
        
        .charts-section .card {
          height: 400px;
        }
        
        .charts-section .card-body {
          height: calc(100% - 60px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .summary-cards {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .charts-section {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .summary-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default ReportsPage