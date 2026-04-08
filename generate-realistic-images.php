<?php
/**
 * Generate realistic product images with better design
 * Usage: php generate-realistic-images.php
 */

// Enhanced product definitions with better styling
$products = [
    // Drinks
    [
        'name' => 'Coca Cola 330ml',
        'file' => 'coca-cola-330ml',
        'bgColor' => '#DC143C',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFDD00',
        'icon' => '🥤'
    ],
    [
        'name' => 'Pepsi 330ml',
        'file' => 'pepsi-330ml',
        'bgColor' => '#004B87',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FF0000',
        'icon' => '🥤'
    ],
    [
        'name' => 'Oishi Green Tea',
        'file' => 'oishi-green-tea',
        'bgColor' => '#2ECC71',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFF700',
        'icon' => '🥤'
    ],
    [
        'name' => 'Nescafe Iced Coffee',
        'file' => 'nescafe-iced-coffee',
        'bgColor' => '#8B4513',
        'textColor' => '#FFFFFF',
        'accentColor' => '#D4AF37',
        'icon' => '☕'
    ],
    // Energy Drinks
    [
        'name' => 'Sting Energy Drink',
        'file' => 'sting-energy',
        'bgColor' => '#FFD700',
        'textColor' => '#000000',
        'accentColor' => '#FF0000',
        'icon' => '⚡'
    ],
    [
        'name' => 'Bacchus Energy',
        'file' => 'bacchus-energy',
        'bgColor' => '#FF6347',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFD700',
        'icon' => '⚡'
    ],
    [
        'name' => 'Sponsor Active',
        'file' => 'sponsor-active',
        'bgColor' => '#1E90FF',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFD700',
        'icon' => '⚡'
    ],
    // Water
    [
        'name' => 'Dasani Water 500ml',
        'file' => 'dasani-water-500ml',
        'bgColor' => '#ADD8E6',
        'textColor' => '#000066',
        'accentColor' => '#0099FF',
        'icon' => '💧'
    ],
    [
        'name' => 'Vital Water 500ml',
        'file' => 'vital-water-500ml',
        'bgColor' => '#87CEEB',
        'textColor' => '#FFFFFF',
        'accentColor' => '#0099FF',
        'icon' => '💧'
    ],
    [
        'name' => 'Kulen Mineral Water 500ml',
        'file' => 'kulen-mineral-water-500ml',
        'bgColor' => '#00CED1',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFD700',
        'icon' => '💧'
    ],
    // Beer & Alcohol
    [
        'name' => 'Angkor Beer Can',
        'file' => 'angkor-beer',
        'bgColor' => '#CD7F32',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFD700',
        'icon' => '🍺'
    ],
    [
        'name' => 'Hanuman Beer Can',
        'file' => 'hanuman-beer',
        'bgColor' => '#8B4513',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFD700',
        'icon' => '🍺'
    ],
    [
        'name' => 'ABC Stout Can',
        'file' => 'abc-stout',
        'bgColor' => '#1C1C1C',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFD700',
        'icon' => '🍺'
    ],
    // Snacks
    [
        'name' => 'Lay\'s Classic Potato Chips',
        'file' => 'lays-potato-chips',
        'bgColor' => '#FFD700',
        'textColor' => '#DC143C',
        'accentColor' => '#FFFFFF',
        'icon' => '🥔'
    ],
    // Candy & Sweets
    [
        'name' => 'Chupa Chups Lolly',
        'file' => 'chupa-chups-lolly',
        'bgColor' => '#FF69B4',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFD700',
        'icon' => '🍭'
    ],
    [
        'name' => 'Mentos Mint',
        'file' => 'mentos-mint',
        'bgColor' => '#32CD32',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFFFFF',
        'icon' => '🍬'
    ],
    // Noodles & Food
    [
        'name' => 'MAMA Noodle Pork',
        'file' => 'mama-noodle',
        'bgColor' => '#FF4500',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFD700',
        'icon' => '🍜'
    ],
    [
        'name' => 'Mee Chiet Beef',
        'file' => 'mee-chiet-beef',
        'bgColor' => '#A0522D',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFD700',
        'icon' => '🍜'
    ],
    // Cigarettes
    [
        'name' => 'Marlboro Gold',
        'file' => 'marlboro-gold',
        'bgColor' => '#D4AF37',
        'textColor' => '#8B0000',
        'accentColor' => '#FFFFFF',
        'icon' => '🚬'
    ],
    [
        'name' => 'Esse Change',
        'file' => 'esse-change',
        'bgColor' => '#228B22',
        'textColor' => '#FFFFFF',
        'accentColor' => '#FFD700',
        'icon' => '🚬'
    ],
];

$outputDir = __DIR__ . '/public/storage/items';

// Create directory if not exists
if (!is_dir($outputDir)) {
    mkdir($outputDir, 0755, true);
}

echo "Generating realistic product images...\n";

foreach ($products as $product) {
    $filepath = $outputDir . '/' . $product['file'] . '.jpg';
    
    // Create high-quality image
    $image = imagecreatetruecolor(400, 500);
    
    // Parse colors
    $bgColor = hexToRgb($product['bgColor']);
    $textColor = hexToRgb($product['textColor']);
    $accentColor = hexToRgb($product['accentColor']);
    
    $bgRGB = imagecolorallocate($image, $bgColor['r'], $bgColor['g'], $bgColor['b']);
    $textRGB = imagecolorallocate($image, $textColor['r'], $textColor['g'], $textColor['b']);
    $accentRGB = imagecolorallocate($image, $accentColor['r'], $accentColor['g'], $accentColor['b']);
    $darkRGB = imagecolorallocate($image, 0, 0, 0);
    $lightRGB = imagecolorallocate($image, 255, 255, 255);
    
    // Fill main background
    imagefilledrectangle($image, 0, 0, 399, 499, $bgRGB);
    
    // Add gradient effect with lighter shade
    for ($i = 0; $i < 50; $i++) {
        $alpha = $i / 50;
        $r = intval($bgColor['r'] + (255 - $bgColor['r']) * $alpha * 0.3);
        $g = intval($bgColor['g'] + (255 - $bgColor['g']) * $alpha * 0.3);
        $b = intval($bgColor['b'] + (255 - $bgColor['b']) * $alpha * 0.3);
        $gradient = imagecolorallocate($image, $r, $g, $b);
        imagefilledrectangle($image, 0, 0, 399, intval(50 * ($i / 50)), $gradient);
    }
    
    // Add decorative border
    $borderColor = imagecolorallocate($image, 0, 0, 0);
    imagerectangle($image, 0, 0, 399, 499, $borderColor);
    imagerectangle($image, 3, 3, 396, 496, $accentRGB);
    
    // Add emoji/icon in top center (using text as placeholder)
    $iconText = $product['icon'];
    imagestring($image, 5, 180, 50, $iconText, $textRGB);
    
    // Add product name with better formatting
    $fontSize = 5;
    $textLines = wordwrap($product['name'], 18, "\n", true);
    $lines = explode("\n", $textLines);
    
    $lineHeight = 35;
    $startY = 120;
    
    foreach ($lines as $i => $line) {
        $textWidth = imagefontwidth($fontSize) * strlen($line);
        $x = intval((400 - $textWidth) / 2);
        $y = $startY + ($i * $lineHeight);
        
        // Text shadow for depth
        imagestring($image, $fontSize, $x + 2, $y + 2, $line, $darkRGB);
        // Main text
        imagestring($image, $fontSize, $x, $y, $line, $textRGB);
    }
    
    // Add accent banner at bottom
    imagefilledrectangle($image, 0, 400, 399, 499, $accentRGB);
    
    // Add "PRODUCT" text at bottom
    $productText = "▼ PRODUCT ▼";
    $textWidth = imagefontwidth(4) * strlen($productText);
    $x = intval((400 - $textWidth) / 2);
    imagestring($image, 4, $x, 440, $productText, $darkRGB);
    
    // Save as high-quality JPEG
    imagejpeg($image, $filepath, 90);
    imagedestroy($image);
    
    echo "✅ Created: {$product['name']}\n";
}

echo "\n✨ All product images generated successfully!\n";

function hexToRgb($hex) {
    $hex = str_replace('#', '', $hex);
    return [
        'r' => hexdec(substr($hex, 0, 2)),
        'g' => hexdec(substr($hex, 2, 2)),
        'b' => hexdec(substr($hex, 4, 2))
    ];
}
?>
