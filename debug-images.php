<?php
// Debug script to check image URL generation
require __DIR__ . '/bootstrap/app.php';

use App\Models\Item;
use Illuminate\Support\Facades\Storage;

$app = app();

// Get first item
$item = Item::first();

echo "=== IMAGE DEBUG ===\n\n";
echo "Item Name: " . $item->name . "\n";
echo "DB image_path: " . ($item->image_path ?? 'NULL') . "\n";
echo "Generated image_url: " . ($item->image_url ?? 'NULL') . "\n";
echo "Storage disk public path: " . Storage::disk('public')->path('') . "\n";
echo "Storage file exists: " . (Storage::disk('public')->exists($item->image_path ?? '') ? 'YES' : 'NO') . "\n";

// Try generating URL manually
if ($item->image_path) {
    $url = Storage::disk('public')->url($item->image_path);
    echo "Manual URL generation: " . $url . "\n";
    
    // Check what APP_URL is
    echo "APP_URL: " . config('app.url') . "\n";
    
    // Check filesystem config
    echo "\n=== FILESYSTEM CONFIG ===\n";
    $disks = config('filesystems.disks.public');
    echo "Public disk driver: " . $disks['driver'] . "\n";
    echo "Public disk path: " . ($disks['path'] ?? 'N/A') . "\n";
    echo "Public disk url: " . ($disks['url'] ?? 'N/A') . "\n";
}

// Check all items
echo "\n=== ALL ITEMS ===\n";
$allItems = Item::take(5)->get();
foreach ($allItems as $item) {
    echo $item->name . " => " . ($item->image_url ?? 'NO URL') . "\n";
}
?>
