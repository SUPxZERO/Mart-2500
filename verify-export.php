<?php
require 'vendor/autoload.php';

use App\Exports\InvoicesExport;
use App\Models\Invoice;

// Create export instance
$export = new InvoicesExport('month', null, null);

echo "=== EXCEL EXPORT STRUCTURE ===\n\n";

echo "Headers:\n";
$headers = $export->headings();
foreach ($headers as $i => $header) {
    echo ($i + 1) . ". {$header}\n";
}

echo "\n\nSample Invoice Row:\n";
echo str_repeat("─", 80) . "\n";

$invoices = Invoice::with('customer')->limit(1)->get();
foreach ($invoices as $invoice) {
    $row = $export->map($invoice);
    foreach ($headers as $i => $header) {
        $value = is_numeric($row[$i]) ? number_format($row[$i]) : $row[$i];
        echo "{$header}: {$value}\n";
    }
}

echo str_repeat("─", 80) . "\n";
echo "\n✅ Export format: ONE INVOICE PER LINE\n";
echo "✅ Total invoices available: " . Invoice::count() . "\n";
?>
