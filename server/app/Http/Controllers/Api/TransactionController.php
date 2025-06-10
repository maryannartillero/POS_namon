<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use App\Models\Discount;
use App\Models\StockMovement;
use App\Models\FarewellMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['user', 'items.product', 'discount']);

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('cashier_id')) {
            $query->where('user_id', $request->cashier_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:cash,card,digital_wallet',
            'amount_paid' => 'required|numeric|min:0',
            'discount_id' => 'nullable|exists:discounts,id',
        ]);

        return DB::transaction(function () use ($request) {
            $subtotal = 0;
            $items = [];

            // Calculate subtotal and validate stock
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                $totalPrice = $product->price * $item['quantity'];
                $subtotal += $totalPrice;

                $items[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'total_price' => $totalPrice,
                ];
            }

            // Apply discount
            $discountAmount = 0;
            if ($request->discount_id) {
                $discount = Discount::findOrFail($request->discount_id);
                $discountAmount = $discount->calculateDiscount($subtotal);
            }

            // Calculate tax (assuming 8% tax rate)
            $taxRate = 0.08;
            $taxAmount = ($subtotal - $discountAmount) * $taxRate;
            $totalAmount = $subtotal - $discountAmount + $taxAmount;

            // Validate payment amount
            if ($request->amount_paid < $totalAmount) {
                throw new \Exception("Insufficient payment amount");
            }

            $changeAmount = $request->amount_paid - $totalAmount;

            // Create transaction
            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'amount_paid' => $request->amount_paid,
                'change_amount' => $changeAmount,
                'payment_method' => $request->payment_method,
                'discount_id' => $request->discount_id,
                'status' => 'completed',
            ]);

            // Create transaction items and update stock
            foreach ($items as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                ]);

                // Update product stock
                $product = $item['product'];
                $previousStock = $product->stock_quantity;
                $newStock = $previousStock - $item['quantity'];
                
                $product->update(['stock_quantity' => $newStock]);

                // Create stock movement record
                StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(),
                    'type' => 'out',
                    'quantity' => $item['quantity'],
                    'previous_stock' => $previousStock,
                    'new_stock' => $newStock,
                    'reason' => 'Sale transaction',
                    'reference_number' => $transaction->transaction_number,
                ]);
            }

            // Send email receipt if customer email provided
            if ($request->customer_email) {
                $this->sendEmailReceipt($transaction);
            }

            // Get farewell message
            $farewellMessage = FarewellMessage::getRandomActiveMessage();

            return response()->json([
                'message' => 'Transaction completed successfully',
                'transaction' => $transaction->load(['items.product', 'user', 'discount']),
                'farewell_message' => $farewellMessage,
            ], 201);
        });
    }

    public function show(Transaction $transaction)
    {
        return response()->json([
            'transaction' => $transaction->load(['items.product', 'user', 'discount', 'feedback'])
        ]);
    }

    public function getDailySales(Request $request)
    {
        $date = $request->get('date', now()->toDateString());
        
        $sales = Transaction::whereDate('created_at', $date)
            ->where('status', 'completed')
            ->selectRaw('
                COUNT(*) as total_transactions,
                SUM(total_amount) as total_sales,
                SUM(discount_amount) as total_discounts,
                AVG(total_amount) as average_sale
            ')
            ->first();

        $topProducts = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_items.product_id', '=', 'products.id')
            ->whereDate('transactions.created_at', $date)
            ->where('transactions.status', 'completed')
            ->selectRaw('
                products.name,
                SUM(transaction_items.quantity) as total_quantity,
                SUM(transaction_items.total_price) as total_revenue
            ')
            ->groupBy('products.id', 'products.name')
            ->orderBy('total_quantity', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'date' => $date,
            'sales_summary' => $sales,
            'top_products' => $topProducts,
        ]);
    }

    public function getMonthlyReport(Request $request)
    {
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        $dailySales = Transaction::whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->where('status', 'completed')
            ->selectRaw('
                DATE(created_at) as date,
                COUNT(*) as transactions,
                SUM(total_amount) as sales
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $monthlySummary = Transaction::whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->where('status', 'completed')
            ->selectRaw('
                COUNT(*) as total_transactions,
                SUM(total_amount) as total_sales,
                SUM(discount_amount) as total_discounts,
                AVG(total_amount) as average_sale
            ')
            ->first();

        return response()->json([
            'month' => $month,
            'year' => $year,
            'daily_sales' => $dailySales,
            'monthly_summary' => $monthlySummary,
        ]);
    }

    private function sendEmailReceipt(Transaction $transaction)
    {
        try {
            $webhookUrl = config('app.make_webhook_url');
            
            if (!$webhookUrl) {
                return;
            }

            Http::post($webhookUrl, [
                'event' => 'email_receipt',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'customer_name' => $transaction->customer_name,
                    'customer_email' => $transaction->customer_email,
                    'total_amount' => $transaction->total_amount,
                    'items' => $transaction->items->map(function ($item) {
                        return [
                            'product_name' => $item->product->name,
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                            'total_price' => $item->total_price,
                        ];
                    }),
                    'created_at' => $transaction->created_at->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send email receipt: ' . $e->getMessage());
        }
    }
}