<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Discount;
use App\Models\FarewellMessage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'Full system access and user management'
        ]);

        $managerRole = Role::create([
            'name' => 'manager',
            'display_name' => 'Manager',
            'description' => 'Inventory management and reports access'
        ]);

        $cashierRole = Role::create([
            'name' => 'cashier',
            'display_name' => 'Cashier',
            'description' => 'Point of sale operations'
        ]);

        // Create default admin user
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'birth_date' => '1990-01-01',
            'gender' => 'other',
            'address' => 'ChicCheckout Headquarters',
            'contact_number' => '+1234567890',
            'email' => 'admin@chiccheckout.com',
            'password' => Hash::make('admin123'),
            'role_id' => $adminRole->id,
            'email_verified_at' => now(),
        ]);

        // Create beauty product categories
        $categories = [
            [
                'name' => 'Skincare',
                'description' => 'Face and body skincare products',
                'image_url' => 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg'
            ],
            [
                'name' => 'Makeup',
                'description' => 'Cosmetics and makeup products',
                'image_url' => 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg'
            ],
            [
                'name' => 'Hair Care',
                'description' => 'Shampoo, conditioner, and hair treatments',
                'image_url' => 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg'
            ],
            [
                'name' => 'Fragrance',
                'description' => 'Perfumes and body sprays',
                'image_url' => 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg'
            ],
            [
                'name' => 'Tools & Accessories',
                'description' => 'Beauty tools and accessories',
                'image_url' => 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg'
            ]
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // Create sample products
        $products = [
            // Skincare
            [
                'name' => 'Vitamin C Serum',
                'description' => 'Brightening vitamin C serum for radiant skin',
                'sku' => 'SKN001',
                'barcode' => '1234567890123',
                'category_id' => 1,
                'price' => 29.99,
                'cost' => 15.00,
                'stock_quantity' => 50,
                'min_stock_level' => 10,
                'image_url' => 'https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg'
            ],
            [
                'name' => 'Hyaluronic Acid Moisturizer',
                'description' => 'Hydrating moisturizer with hyaluronic acid',
                'sku' => 'SKN002',
                'barcode' => '1234567890124',
                'category_id' => 1,
                'price' => 24.99,
                'cost' => 12.50,
                'stock_quantity' => 30,
                'min_stock_level' => 5,
                'image_url' => 'https://images.pexels.com/photos/7755515/pexels-photo-7755515.jpeg'
            ],
            // Makeup
            [
                'name' => 'Matte Liquid Lipstick',
                'description' => 'Long-lasting matte liquid lipstick',
                'sku' => 'MKP001',
                'barcode' => '1234567890125',
                'category_id' => 2,
                'price' => 18.99,
                'cost' => 8.00,
                'stock_quantity' => 75,
                'min_stock_level' => 15,
                'image_url' => 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg'
            ],
            [
                'name' => 'Foundation Palette',
                'description' => 'Multi-shade foundation palette',
                'sku' => 'MKP002',
                'barcode' => '1234567890126',
                'category_id' => 2,
                'price' => 45.99,
                'cost' => 22.00,
                'stock_quantity' => 25,
                'min_stock_level' => 5,
                'image_url' => 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg'
            ],
            // Hair Care
            [
                'name' => 'Argan Oil Shampoo',
                'description' => 'Nourishing shampoo with argan oil',
                'sku' => 'HAR001',
                'barcode' => '1234567890127',
                'category_id' => 3,
                'price' => 16.99,
                'cost' => 8.50,
                'stock_quantity' => 40,
                'min_stock_level' => 8,
                'image_url' => 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg'
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        // Create sample discounts
        Discount::create([
            'name' => 'New Customer Discount',
            'description' => '10% off for new customers',
            'type' => 'percentage',
            'value' => 10.00,
            'minimum_amount' => 25.00,
            'start_date' => now()->subDays(30),
            'end_date' => now()->addDays(30),
            'is_active' => true,
        ]);

        Discount::create([
            'name' => 'Holiday Special',
            'description' => '$5 off orders over $50',
            'type' => 'fixed',
            'value' => 5.00,
            'minimum_amount' => 50.00,
            'start_date' => now()->subDays(10),
            'end_date' => now()->addDays(20),
            'is_active' => true,
        ]);

        // Create farewell messages
        $farewellMessages = [
            'Thank you for choosing ChicCheckout! Have a beautiful day!',
            'We appreciate your business. Come back soon for more beauty essentials!',
            'Thank you for shopping with us. Stay beautiful!',
            'Your beauty journey continues with ChicCheckout. See you again!',
            'Thank you for your purchase. Enjoy your new beauty products!'
        ];

        foreach ($farewellMessages as $index => $message) {
            FarewellMessage::create([
                'message' => $message,
                'is_active' => true,
                'display_order' => $index + 1,
            ]);
        }
    }
}