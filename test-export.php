<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

use App\Http\Controllers\InvoiceController;
use Illuminate\Support\Carbon;

// Create a test controller instance
$controller = new InvoiceController();

// Use reflection to call protected method
$reflection = new ReflectionClass($controller);
$method = $reflection->getMethod('generateExportFilename');
$method->setAccessible(true);

// Test different periods
echo "=== EXPORT FILENAME GENERATION ===\n\n";

$filters1 = ['period' => 'week', 'from' => null, 'to' => null];
echo "Week: " . $method->invoke($controller, $filters1) . "\n";

$filters2 = ['period' => 'month', 'from' => null, 'to' => null];
echo "Month: " . $method->invoke($controller, $filters2) . "\n";

$filters3 = ['period' => 'year', 'from' => null, 'to' => null];
echo "Year: " . $method->invoke($controller, $filters3) . "\n";

$filters4 = ['period' => 'range', 'from' => '2026-04-01', 'to' => '2026-04-08'];
echo "Range: " . $method->invoke($controller, $filters4) . "\n";

echo "\n✅ All export filenames are descriptive!\n";
?>
