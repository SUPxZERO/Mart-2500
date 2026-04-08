<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Customer;
use App\Models\Item;
use Carbon\Carbon;

$items = Item::limit(5)->get();
$customer = Customer::first();

if ($items->count() > 0 && $customer) {
    for ($i = 0; $i < 3; $i++) {
        $selectedItems = [];
        $total = 0;
        
        // Pre-calculate total
        for ($j = 0; $j < 2; $j++) {
            $item = $items->random();
            $qty = rand(1, 3);
            $selectedItems[] = ['item' => $item, 'qty' => $qty];
            $total += $qty * $item->default_price;
        }
        
        // Create invoice with total using unique number with timestamp
        $invoice = Invoice::create([
            'customer_id' => $customer->id,
            'invoice_number' => 'INV-' . Carbon::now()->format('Ymd-His') . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
            'status' => 'Completed',
            'payment_method' => 'cash',
            'payment_provider' => 'Bakong',
            'total_khr' => $total,
            'created_at' => Carbon::now(),
        ]);

        // Add items
        foreach ($selectedItems as $si) {
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'item_name' => $si['item']->name,
                'qty' => $si['qty'],
                'custom_price_sold_at' => $si['item']->default_price
            ]);
        }
    }
    
    $todayTotal = Invoice::where('status', 'Completed')->whereBetween('created_at', [Carbon::now()->startOfDay(), Carbon::now()->endOfDay()])->sum('total_khr');
    echo "✅ Created 3 invoices for today with total revenue: " . number_format($todayTotal) . " KHR\n";
} else {
    echo "❌ No items or customers found\n";
}
