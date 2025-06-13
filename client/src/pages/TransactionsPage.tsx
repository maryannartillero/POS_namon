import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Search, Eye, ShoppingCart, Calendar, User, CreditCard, Printer, Receipt } from 'lucide-react'
import { transactionsAPI, productsAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ReceiptPrinter from '../components/reports/ReceiptPrinter'
import toast from 'react-hot-toast'

interface Transaction {
  id: number
  transaction_number: string
  customer_name: string
  customer_email: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  amount_paid: number
  change_amount: number
  payment_method: string
  status: string
  user: {
    id: number
    first_name: string
    last_name: string
  }
  items: TransactionItem[]
  created_at: string
}

interface TransactionItem {
  id: number
  product: {
    id: number
    name: string
    sku: string
  }
  quantity: number
  unit_price: number
  total_price: number
}

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock_quantity: number
}

const TransactionsPage: React.FC = () => {
  const [showPOSModal, setShowPOSModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [cart, setCart] = useState<Array<{
    product: Product
    quantity: number
  }>>([])
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: ''
  })
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cash',
    amount_paid: ''
  })

  const queryClient = useQueryClient()

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery(
    ['transactions', searchTerm, dateFrom, dateTo],
    () => transactionsAPI.getAll({ 
      search: searchTerm,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined
    }),
    { keepPreviousData: true }
  )

  // Fetch products for POS
  const { data: productsData } = useQuery(
    'products-pos',
    () => productsAPI.getAll({ active_only: true }),
    { enabled: showPOSModal }
  )

  // Create transaction mutation
  const createTransactionMutation = useMutation(transactionsAPI.create, {
    onSuccess: (response) => {
      queryClient.invalidateQueries('transactions')
      toast.success('Transaction completed successfully!')
      setShowPOSModal(false)
      setCart([])
      setCustomerInfo({ name: '', email: '' })
      setPaymentInfo({ method: 'cash', amount_paid: '' })
      
      // Show receipt
      setSelectedTransaction(response.data.transaction)
      setShowReceiptModal(true)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete transaction')
    }
  })

  const transactions: Transaction[] = transactionsData?.data?.data || []
  const products: Product[] = productsData?.data?.data || []

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      } else {
        toast.error('Insufficient stock')
      }
    } else {
      if (product.stock_quantity > 0) {
        setCart([...cart, { product, quantity: 1 }])
      } else {
        toast.error('Product out of stock')
      }
    }
  }

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId))
    } else {
      const product = products.find(p => p.id === productId)
      if (product && quantity <= product.stock_quantity) {
        setCart(cart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        ))
      } else {
        toast.error('Insufficient stock')
      }
    }
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.08 // 8% tax
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)
    return subtotal + tax
  }

  const handleCompleteTransaction = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    const total = calculateTotal()
    const amountPaid = parseFloat(paymentInfo.amount_paid)

    if (amountPaid < total) {
      toast.error('Insufficient payment amount')
      return
    }

    const transactionData = {
      customer_name: customerInfo.name || null,
      customer_email: customerInfo.email || null,
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      })),
      payment_method: paymentInfo.method,
      amount_paid: amountPaid
    }

    createTransactionMutation.mutate(transactionData)
  }

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowReceiptModal(true)
  }

  return (
    <div className="transactions-page fade-in">
      {/* Header */}
      <div className="page-header flex-between mb-4">
        <div>
          <h1>Transactions</h1>
          <p className="text-muted">View and manage sales transactions</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowPOSModal(true)}
        >
          <Plus size={16} />
          New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section mb-4">
        <div className="card">
          <div className="card-body">
            <div className="grid-3" style={{ gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#666'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-input"
                placeholder="From Date"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="form-input"
                placeholder="To Date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h3>Transactions ({transactions.length})</h3>
        </div>
        <div className="card-body p-0">
          {transactionsLoading ? (
            <div className="text-center p-4">
              <LoadingSpinner />
              <p className="mt-2">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted">No transactions found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Transaction #</th>
                    <th>Customer</th>
                    <th>Cashier</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <code>{transaction.transaction_number}</code>
                      </td>
                      <td>
                        {transaction.customer_name || 'Walk-in Customer'}
                        {transaction.customer_email && (
                          <>
                            <br />
                            <small className="text-muted">{transaction.customer_email}</small>
                          </>
                        )}
                      </td>
                      <td>
                        {transaction.user.first_name} {transaction.user.last_name}
                      </td>
                      <td>
                        {transaction.items.length} item(s)
                      </td>
                      <td>
                        <strong>₱{transaction.total_amount.toFixed(2)}</strong>
                      </td>
                      <td>
                        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                          <CreditCard size={14} />
                          {transaction.payment_method}
                        </div>
                      </td>
                      <td>
                        {new Date(transaction.created_at).toLocaleDateString()}
                        <br />
                        <small className="text-muted">
                          {new Date(transaction.created_at).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <div className="flex" style={{ gap: '0.5rem' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleViewReceipt(transaction)}
                            title="View Receipt"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewReceipt(transaction)}
                            title="Print Receipt"
                          >
                            <Receipt size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* POS Modal */}
      {showPOSModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '1200px', height: '90vh' }}>
            <div className="modal-header">
              <h3 className="modal-title">Point of Sale</h3>
              <button className="modal-close" onClick={() => setShowPOSModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', gap: '1rem', height: 'calc(90vh - 120px)' }}>
              {/* Products */}
              <div style={{ flex: 2, overflowY: 'auto' }}>
                <h4>Products</h4>
                <div className="grid-3" style={{ gap: '1rem' }}>
                  {products.map((product) => (
                    <div 
                      key={product.id}
                      className="card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => addToCart(product)}
                    >
                      <div className="card-body text-center">
                        <h5>{product.name}</h5>
                        <p className="text-muted">{product.sku}</p>
                        <p><strong>₱{product.price.toFixed(2)}</strong></p>
                        <p className="text-muted">Stock: {product.stock_quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart */}
              <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '1rem' }}>
                <h4>Cart</h4>
                
                {/* Customer Info */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Customer Name (Optional)"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input mb-2"
                  />
                  <input
                    type="email"
                    placeholder="Customer Email (Optional)"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input"
                  />
                </div>

                {/* Cart Items */}
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex-between mb-2 p-2" style={{ border: '1px solid #eee', borderRadius: '4px' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{item.product.name}</strong>
                        <br />
                        <small>₱{item.product.price.toFixed(2)} each</small>
                      </div>
                      <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mb-3">
                  <div className="flex-between">
                    <span>Subtotal:</span>
                    <span>₱{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex-between">
                    <span>Tax (8%):</span>
                    <span>₱{calculateTax(calculateSubtotal()).toFixed(2)}</span>
                  </div>
                  <div className="flex-between" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    <span>Total:</span>
                    <span>₱{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment */}
                <div className="mb-3">
                  <select
                    value={paymentInfo.method}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value }))}
                    className="form-select mb-2"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="digital_wallet">Digital Wallet</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Amount Paid"
                    value={paymentInfo.amount_paid}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, amount_paid: e.target.value }))}
                    className="form-input"
                    step="0.01"
                    min={calculateTotal()}
                  />
                  {paymentInfo.amount_paid && (
                    <div className="mt-2">
                      <strong>Change: ₱{(parseFloat(paymentInfo.amount_paid) - calculateTotal()).toFixed(2)}</strong>
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={handleCompleteTransaction}
                  disabled={createTransactionMutation.isLoading || cart.length === 0}
                >
                  {createTransactionMutation.isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Processing...
                    </>
                  ) : (
                    'Complete Transaction'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedTransaction && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Receipt - {selectedTransaction.transaction_number}</h3>
              <button className="modal-close" onClick={() => setShowReceiptModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <ReceiptPrinter transaction={selectedTransaction} />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowReceiptModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsPage