<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\FarewellMessageController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User management (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::get('/roles', [UserController::class, 'getRoles']);
        
        // Role management
        Route::apiResource('roles', RoleController::class);
    });

    // Category management (Admin, Manager)
    Route::middleware('role:admin,manager')->group(function () {
        Route::apiResource('categories', CategoryController::class);
    });

    // Product management (Admin, Manager)
    Route::middleware('role:admin,manager')->group(function () {
        Route::apiResource('products', ProductController::class);
        Route::post('/products/{product}/adjust-stock', [ProductController::class, 'adjustStock']);
        Route::get('/products/reports/low-stock', [ProductController::class, 'getLowStockProducts']);
    });

    // Discount management (Admin, Manager)
    Route::middleware('role:admin,manager')->group(function () {
        Route::apiResource('discounts', DiscountController::class);
    });

    // Transaction management (All roles)
    Route::apiResource('transactions', TransactionController::class)->only(['index', 'store', 'show']);
    Route::get('/transactions/reports/daily', [TransactionController::class, 'getDailySales']);
    Route::get('/transactions/reports/monthly', [TransactionController::class, 'getMonthlyReport']);

    // Active discounts for POS (All roles)
    Route::get('/discounts/active/list', [DiscountController::class, 'getActiveDiscounts']);

    // Feedback management
    Route::apiResource('feedback', FeedbackController::class)->only(['index', 'store', 'show']);
    Route::get('/feedback/analytics/summary', [FeedbackController::class, 'getAnalytics']);

    // Farewell messages (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('farewell-messages', FarewellMessageController::class);
    });
    
    // Get random farewell message (All roles)
    Route::get('/farewell-messages/random/get', [FarewellMessageController::class, 'getRandom']);
});