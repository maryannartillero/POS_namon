import React from 'react';
import { Printer, Download, Mail } from 'lucide-react';

interface Transaction {
  id: number;
  transaction_number: string;
  customer_name?: string;
  customer_email?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  change_amount: number;
  payment_method: string;
  user: {
    first_name: string;
    last_name: string;
  };
  items: Array<{
    id: number;
    product: {
      name: string;
      sku: string;
    };
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  created_at: string;
}

interface ReceiptPrinterProps {
  transaction: Transaction;
  className?: string;
}

const ReceiptPrinter: React.FC<ReceiptPrinterProps> = ({ 
  transaction, 
  className = '' 
}) => {
  const generateReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.transaction_number}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              margin: 0; 
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
            }
            .receipt { 
              background: white;
              padding: 20px;
              border: 1px solid #ddd;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .logo {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .line { 
              border-bottom: 1px dashed #000; 
              margin: 10px 0; 
            }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0; 
              font-size: 11px;
            }
            .item-name {
              flex: 1;
              margin-right: 10px;
            }
            .item-qty {
              width: 30px;
              text-align: center;
            }
            .item-price {
              width: 60px;
              text-align: right;
            }
            .total { 
              font-weight: bold; 
              font-size: 14px; 
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #000;
            }
            .barcode { 
              text-align: center; 
              font-family: 'Libre Barcode 128', monospace; 
              font-size: 24px; 
              margin: 20px 0; 
              letter-spacing: 2px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 10px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .receipt { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">ChicCheckout</div>
              <div>Beauty POS System</div>
              <div style="margin-top: 10px;">
                <strong>Receipt #${transaction.transaction_number}</strong>
              </div>
              <div>${new Date(transaction.created_at).toLocaleString()}</div>
            </div>
            
            ${transaction.customer_name ? `
              <div class="row">
                <span>Customer:</span>
                <span>${transaction.customer_name}</span>
              </div>
            ` : ''}
            
            <div class="row">
              <span>Cashier:</span>
              <span>${transaction.user.first_name} ${transaction.user.last_name}</span>
            </div>
            
            <div class="line"></div>
            
            <div style="font-weight: bold; margin-bottom: 10px;">
              <div class="row">
                <span>Item</span>
                <span>Qty</span>
                <span>Amount</span>
              </div>
            </div>
            
            ${transaction.items.map(item => `
              <div class="item">
                <div class="item-name">${item.product.name}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">₱${item.total_price.toFixed(2)}</div>
              </div>
              <div style="font-size: 10px; color: #666; margin-left: 0;">
                ${item.product.sku} @ ₱${item.unit_price.toFixed(2)} each
              </div>
            `).join('')}
            
            <div class="line"></div>
            
            <div class="row">
              <span>Subtotal:</span>
              <span>₱${transaction.subtotal.toFixed(2)}</span>
            </div>
            
            ${transaction.discount_amount > 0 ? `
              <div class="row">
                <span>Discount:</span>
                <span>-₱${transaction.discount_amount.toFixed(2)}</span>
              </div>
            ` : ''}
            
            <div class="row">
              <span>Tax (8%):</span>
              <span>₱${transaction.tax_amount.toFixed(2)}</span>
            </div>
            
            <div class="row total">
              <span>TOTAL:</span>
              <span>₱${transaction.total_amount.toFixed(2)}</span>
            </div>
            
            <div class="line"></div>
            
            <div class="row">
              <span>Payment (${transaction.payment_method.toUpperCase()}):</span>
              <span>₱${transaction.amount_paid.toFixed(2)}</span>
            </div>
            
            <div class="row">
              <span>Change:</span>
              <span>₱${transaction.change_amount.toFixed(2)}</span>
            </div>
            
            <div class="barcode">*${transaction.transaction_number}*</div>
            
            <div class="footer">
              <div>Thank you for shopping with us!</div>
              <div>Visit us again soon!</div>
              <div style="margin-top: 10px;">
                ChicCheckout Beauty POS System<br>
                Generated on ${new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(generateReceiptHTML());
    printWindow.document.close();
    printWindow.print();
  };

  const downloadReceipt = () => {
    const receiptHTML = generateReceiptHTML();
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${transaction.transaction_number}.html`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const emailReceipt = () => {
    if (!transaction.customer_email) {
      alert('No customer email available for this transaction');
      return;
    }

    const subject = `Receipt - ${transaction.transaction_number}`;
    const body = `Dear ${transaction.customer_name || 'Customer'},\n\nThank you for your purchase! Please find your receipt details below:\n\nTransaction: ${transaction.transaction_number}\nDate: ${new Date(transaction.created_at).toLocaleString()}\nTotal: ₱${transaction.total_amount.toFixed(2)}\n\nBest regards,\nChicCheckout Team`;
    
    const mailtoLink = `mailto:${transaction.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <div className={`receipt-printer ${className}`}>
      <div className="receipt-actions flex gap-2">
        <button
          onClick={printReceipt}
          className="btn btn-primary"
          title="Print Receipt"
        >
          <Printer size={16} />
          Print
        </button>
        
        <button
          onClick={downloadReceipt}
          className="btn btn-secondary"
          title="Download Receipt"
        >
          <Download size={16} />
          Download
        </button>
        
        {transaction.customer_email && (
          <button
            onClick={emailReceipt}
            className="btn btn-success"
            title="Email Receipt"
          >
            <Mail size={16} />
            Email
          </button>
        )}
      </div>

      {/* Receipt Preview */}
      <div className="receipt-preview mt-4 p-4 bg-gray-50 rounded-lg max-w-sm mx-auto">
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg">ChicCheckout</h3>
          <p className="text-sm text-gray-600">Beauty POS System</p>
          <p className="text-sm font-semibold">Receipt #{transaction.transaction_number}</p>
          <p className="text-xs text-gray-500">
            {new Date(transaction.created_at).toLocaleString()}
          </p>
        </div>

        <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
          {transaction.customer_name && (
            <div className="flex justify-between text-sm">
              <span>Customer:</span>
              <span>{transaction.customer_name}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Cashier:</span>
            <span>{transaction.user.first_name} {transaction.user.last_name}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
          {transaction.items.map((item) => (
            <div key={item.id} className="mb-2">
              <div className="flex justify-between text-sm">
                <span className="flex-1">{item.product.name}</span>
                <span className="w-8 text-center">{item.quantity}</span>
                <span className="w-16 text-right">₱{item.total_price.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 ml-0">
                {item.product.sku} @ ₱{item.unit_price.toFixed(2)} each
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-400 pt-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₱{transaction.subtotal.toFixed(2)}</span>
          </div>
          {transaction.discount_amount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-₱{transaction.discount_amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>₱{transaction.tax_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-gray-400 pt-1 mt-1">
            <span>TOTAL:</span>
            <span>₱{transaction.total_amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 pt-2 text-sm">
          <div className="flex justify-between">
            <span>Paid ({transaction.payment_method.toUpperCase()}):</span>
            <span>₱{transaction.amount_paid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Change:</span>
            <span>₱{transaction.change_amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center mt-4 pt-2 border-t border-dashed border-gray-400">
          <div className="font-mono text-lg tracking-wider">
            *{transaction.transaction_number}*
          </div>
          <div className="text-xs text-gray-600 mt-2">
            <p>Thank you for shopping with us!</p>
            <p>Visit us again soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrinter;