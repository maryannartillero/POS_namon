<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerFeedback;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $query = CustomerFeedback::with('transaction');

        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $feedback = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($feedback);
    }

    public function store(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'rating' => 'required|integer|min:1|max:5',
            'comments' => 'nullable|string|max:1000',
            'customer_email' => 'nullable|email',
        ]);

        // Check if feedback already exists for this transaction
        $existingFeedback = CustomerFeedback::where('transaction_id', $request->transaction_id)->first();
        
        if ($existingFeedback) {
            return response()->json([
                'message' => 'Feedback already exists for this transaction'
            ], 422);
        }

        $feedback = CustomerFeedback::create($request->all());

        // Send feedback notification via Make.com
        $this->sendFeedbackNotification($feedback);

        return response()->json([
            'message' => 'Thank you for your feedback!',
            'feedback' => $feedback->load('transaction')
        ], 201);
    }

    public function show(CustomerFeedback $feedback)
    {
        return response()->json([
            'feedback' => $feedback->load('transaction')
        ]);
    }

    public function getAnalytics(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());

        $analytics = CustomerFeedback::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('
                COUNT(*) as total_feedback,
                AVG(rating) as average_rating,
                SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive_feedback,
                SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) as negative_feedback
            ')
            ->first();

        $ratingDistribution = CustomerFeedback::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->orderBy('rating')
            ->get();

        $recentComments = CustomerFeedback::whereBetween('created_at', [$dateFrom, $dateTo])
            ->whereNotNull('comments')
            ->where('comments', '!=', '')
            ->with('transaction')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Calculate satisfaction score (percentage of ratings 4 and above)
        $satisfactionScore = $analytics->total_feedback > 0 
            ? ($analytics->positive_feedback / $analytics->total_feedback) * 100 
            : 0;

        // Generate improvement suggestions based on feedback
        $suggestions = $this->generateImprovementSuggestions($analytics, $satisfactionScore);

        return response()->json([
            'period' => [
                'from' => $dateFrom,
                'to' => $dateTo
            ],
            'analytics' => $analytics,
            'satisfaction_score' => round($satisfactionScore, 2),
            'rating_distribution' => $ratingDistribution,
            'recent_comments' => $recentComments,
            'improvement_suggestions' => $suggestions,
        ]);
    }

    private function generateImprovementSuggestions($analytics, $satisfactionScore)
    {
        $suggestions = [];

        if ($satisfactionScore < 70) {
            $suggestions[] = [
                'priority' => 'high',
                'category' => 'Customer Satisfaction',
                'suggestion' => 'Customer satisfaction is below 70%. Consider reviewing service quality and product offerings.',
                'action' => 'Conduct staff training and review customer complaints'
            ];
        }

        if ($analytics->average_rating < 3.5) {
            $suggestions[] = [
                'priority' => 'high',
                'category' => 'Service Quality',
                'suggestion' => 'Average rating is below 3.5. Focus on improving customer service and product quality.',
                'action' => 'Implement quality control measures and customer service training'
            ];
        }

        if ($analytics->negative_feedback > ($analytics->total_feedback * 0.2)) {
            $suggestions[] = [
                'priority' => 'medium',
                'category' => 'Negative Feedback',
                'suggestion' => 'High percentage of negative feedback. Investigate common issues and address them.',
                'action' => 'Analyze negative feedback patterns and implement corrective measures'
            ];
        }

        if ($analytics->total_feedback < 10) {
            $suggestions[] = [
                'priority' => 'low',
                'category' => 'Feedback Collection',
                'suggestion' => 'Low feedback volume. Encourage more customers to provide feedback.',
                'action' => 'Implement feedback incentives and make the process more accessible'
            ];
        }

        if (empty($suggestions)) {
            $suggestions[] = [
                'priority' => 'low',
                'category' => 'Maintenance',
                'suggestion' => 'Great job! Customer satisfaction is good. Continue maintaining quality service.',
                'action' => 'Keep monitoring feedback and maintain current service standards'
            ];
        }

        return $suggestions;
    }

    private function sendFeedbackNotification($feedback)
    {
        try {
            $webhookUrl = config('app.make_webhook_url');
            
            if (!$webhookUrl) {
                return;
            }

            Http::post($webhookUrl, [
                'event' => 'customer_feedback',
                'data' => [
                    'feedback_id' => $feedback->id,
                    'transaction_id' => $feedback->transaction_id,
                    'rating' => $feedback->rating,
                    'comments' => $feedback->comments,
                    'customer_email' => $feedback->customer_email,
                    'created_at' => $feedback->created_at->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send feedback notification: ' . $e->getMessage());
        }
    }
}