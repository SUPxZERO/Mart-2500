<?php
/**
 * Generate product images for items
 * Usage: php generate-product-images.php
 */

// Product definitions with colors and names
$products = [
    // Drinks
    ['name' => 'Coca Cola 330ml', 'file' => 'coca-cola-330ml', 'colors' => ['bg' => '#DC143C', 'text' => '#FFFFFF']],
    ['name' => 'Pepsi 330ml', 'file' => 'pepsi-330ml', 'colors' => ['bg' => '#004B87', 'text' => '#FFFFFF']],
    ['name' => 'Oishi Green Tea', 'file' => 'oishi-green-tea', 'colors' => ['bg' => '#2ECC71', 'text' => '#FFFFFF']],
    ['name' => 'Nescafe Iced Coffee', 'file' => 'nescafe-iced-coffee', 'colors' => ['bg' => '#8B4513', 'text' => '#FFFFFF']],
    
    // Energy Drinks
    ['name' => 'Sting Energy Drink', 'file' => 'sting-energy', 'colors' => ['bg' => '#FFD700', 'text' => '#000000']],
    ['name' => 'Bacchus Energy', 'file' => 'bacchus-energy', 'colors' => ['bg' => '#FF6347', 'text' => '#FFFFFF']],
    ['name' => 'Sponsor Active', 'file' => 'sponsor-active', 'colors' => ['bg' => '#1E90FF', 'text' => '#FFFFFF']],
    
    // Water
    ['name' => 'Dasani Water 500ml', 'file' => 'dasani-water-500ml', 'colors' => ['bg' => '#ADD8E6', 'text' => '#000000']],
    ['name' => 'Vital Water 500ml', 'file' => 'vital-water-500ml', 'colors' => ['bg' => '#87CEEB', 'text' => '#FFFFFF']],
    ['name' => 'Kulen Mineral Water 500ml', 'file' => 'kulen-mineral-water-500ml', 'colors' => ['bg' => '#00CED1', 'text' => '#FFFFFF']],
    
    // Beer & Alcohol
    ['name' => 'Angkor Beer Can', 'file' => 'angkor-beer', 'colors' => ['bg' => '#CD7F32', 'text' => '#FFFFFF']],
    ['name' => 'Hanuman Beer Can', 'file' => 'hanuman-beer', 'colors' => ['bg' => '#8B4513', 'text' => '#FFFFFF']],
    ['name' => 'ABC Stout Can', 'file' => 'abc-stout', 'colors' => ['bg' => '#1C1C1C', 'text' => '#FFFFFF']],
    
    // Snacks
    ['name' => 'Lay\'s Classic Potato Chips', 'file' => 'lays-potato-chips', 'colors' => ['bg' => '#FFD700', 'text' => '#DC143C']],
    
    // Candy & Sweets
    ['name' => 'Chupa Chups Lolly', 'file' => 'chupa-chups-lolly', 'colors' => ['bg' => '#FF69B4', 'text' => '#FFFFFF']],
    ['name' => 'Mentos Mint', 'file' => 'mentos-mint', 'colors' => ['bg' => '#32CD32', 'text' => '#FFFFFF']],
    
    // Noodles & Food
    ['name' => 'MAMA Noodle Pork', 'file' => 'mama-noodle', 'colors' => ['bg' => '#FF4500', 'text' => '#FFFFFF']],
    ['name' => 'Mee Chiet Beef', 'file' => 'mee-chiet-beef', 'colors' => ['bg' => '#A0522D', 'text' => '#FFFFFF']],
    
    // Cigarettes
    ['name' => 'Marlboro Gold', 'file' => 'marlboro-gold', 'colors' => ['bg' => '#D4AF37', 'text' => '#8B0000']],
    ['name' => 'Esse Change', 'file' => 'esse-change', 'colors' => ['bg' => '#228B22', 'text' => '#FFFFFF']],
];

$outputDir = __DIR__ . '/storage/app/public/items';

// Create directory if not exists
if (!is_dir($outputDir)) {
    mkdir($outputDir, 0775, true);
}

echo "Generating product images...\n";

foreach ($products as $product) {
    $filepath = $outputDir . '/' . $product['file'] . '.jpg';
    
    // Create image
    $image = imagecreatetruecolor(300, 300);
    
    // Parse colors
    $bgColor = sscanf($product['colors']['bg'], '#%2x%2x%2x');
    $textColor = sscanf($product['colors']['text'], '#%2x%2x%2x');
    
    $bgRGB = imagecolorallocate($image, $bgColor[0], $bgColor[1], $bgColor[2]);
    $textRGB = imagecolorallocate($image, $textColor[0], $textColor[1], $textColor[2]);
    
    // Fill background
    imagefilledrectangle($image, 0, 0, 300, 300, $bgRGB);
    
    // Add border
    $borderColor = imagecolorallocate($image, 100, 100, 100);
    imagerectangle($image, 0, 0, 299, 299, $borderColor);
    
    // Add product name
    $fontSize = 4;
    $textLines = wordwrap($product['name'], 15, "\n", true);
    $lines = explode("\n", $textLines);
    
    $lineHeight = 30;
    $startY = (300 - (count($lines) * $lineHeight)) / 2;
    
    foreach ($lines as $i => $line) {
        $textWidth = imagefontwidth($fontSize) * strlen($line);
        $x = (300 - $textWidth) / 2;
        $y = $startY + ($i * $lineHeight);
        
        imagestring($image, $fontSize, $x, $y, $line, $textRGB);
    }
    
    // Save as JPEG
    imagejpeg($image, $filepath, 85);
    imagedestroy($image);
    
    echo "✅ Created: {$product['name']} -> {$product['file']}.jpg\n";
}

echo "\n✨ All product images generated successfully!\n";
?>
