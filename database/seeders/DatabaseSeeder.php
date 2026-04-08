<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Exchange Rate
        \App\Models\ExchangeRate::create([
            'usd_to_khr' => 4000,
        ]);

        // 2. Seed Default Categories
        $categories = [
            'Drinks', 'Energy Drinks', 'Water',
            'Beer & Alcohol', 'Snacks', 'Noodles & Food',
            'Cigarettes', 'Candy & Sweets', 'General',
        ];
        foreach ($categories as $i => $name) {
            \App\Models\Category::create(['name' => $name, 'sort_order' => $i]);
        }

        // 2. Seed 5 Mock Customers
        $customers = [
            ['name' => 'Sokha', 'phone_number' => '012345678', 'total_debt_balance' => 0, 'total_lifetime_spent' => 0],
            ['name' => 'Dara', 'phone_number' => '098765432', 'total_debt_balance' => 15000, 'total_lifetime_spent' => 45000],
            ['name' => 'Bopha', 'phone_number' => '011223344', 'total_debt_balance' => 0, 'total_lifetime_spent' => 120000],
            ['name' => 'Chetra', 'phone_number' => '077889900', 'total_debt_balance' => -5000, 'total_lifetime_spent' => 80000], // Has 5000 store credit
            ['name' => 'Vannak', 'phone_number' => '069112233', 'total_debt_balance' => 50000, 'total_lifetime_spent' => 50000],
        ];

        foreach ($customers as $customer) {
            \App\Models\Customer::create($customer);
        }

        // 3. Seed 20 Mock Items
        $items = [
            ['name' => 'Coca Cola 330ml',         'default_cost' => 1800, 'default_price' => 2500,  'category' => 'Drinks'],
            ['name' => 'Pepsi 330ml',              'default_cost' => 1800, 'default_price' => 2500,  'category' => 'Drinks'],
            ['name' => 'Oishi Green Tea',          'default_cost' => 1800, 'default_price' => 2500,  'category' => 'Drinks'],
            ['name' => 'Nescafe Iced Coffee',      'default_cost' => 2500, 'default_price' => 3500,  'category' => 'Drinks'],
            ['name' => 'Sting Energy Drink',       'default_cost' => 2000, 'default_price' => 3000,  'category' => 'Energy Drinks'],
            ['name' => 'Bacchus Energy',           'default_cost' => 2200, 'default_price' => 3500,  'category' => 'Energy Drinks'],
            ['name' => 'Sponsor Active',           'default_cost' => 2000, 'default_price' => 3000,  'category' => 'Energy Drinks'],
            ['name' => 'Dasani Water 500ml',       'default_cost' => 600,  'default_price' => 1000,  'category' => 'Water'],
            ['name' => 'Vital Water 500ml',        'default_cost' => 700,  'default_price' => 1000,  'category' => 'Water'],
            ['name' => 'Kulen Mineral Water 500ml','default_cost' => 1000, 'default_price' => 1500,  'category' => 'Water'],
            ['name' => 'Angkor Beer Can',          'default_cost' => 2200, 'default_price' => 3000,  'category' => 'Beer & Alcohol'],
            ['name' => 'Hanuman Beer Can',         'default_cost' => 2500, 'default_price' => 3500,  'category' => 'Beer & Alcohol'],
            ['name' => 'ABC Stout Can',            'default_cost' => 4500, 'default_price' => 6000,  'category' => 'Beer & Alcohol'],
            ['name' => 'Lay\'s Classic Potato Chips','default_cost' => 3000,'default_price' => 4500, 'category' => 'Snacks'],
            ['name' => 'Chupa Chups Lolly',        'default_cost' => 200,  'default_price' => 500,   'category' => 'Candy & Sweets'],
            ['name' => 'Mentos Mint',              'default_cost' => 1200, 'default_price' => 2000,  'category' => 'Candy & Sweets'],
            ['name' => 'MAMA Noodle Pork',         'default_cost' => 800,  'default_price' => 1500,  'category' => 'Noodles & Food'],
            ['name' => 'Mee Chiet Beef',           'default_cost' => 900,  'default_price' => 1500,  'category' => 'Noodles & Food'],
            ['name' => 'Marlboro Gold',            'default_cost' => 5500, 'default_price' => 7000,  'category' => 'Cigarettes'],
            ['name' => 'Esse Change',              'default_cost' => 5000, 'default_price' => 6500,  'category' => 'Cigarettes'],
        ];

        foreach ($items as $item) {
            \App\Models\Item::create($item);
        }
    }
}
