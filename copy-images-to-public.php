<?php
// Copy images from storage to public
$source = __DIR__ . '/storage/app/public/items';
$dest = __DIR__ . '/public/images/items';

// Create destination directory
if (!is_dir($dest)) {
    mkdir($dest, 0755, true);
}

// Copy all JPG files
$files = glob($source . '/*.jpg');
echo "Copying " . count($files) . " images...\n";

foreach ($files as $file) {
    $filename = basename($file);
    $destFile = $dest . '/' . $filename;
    
    if (copy($file, $destFile)) {
        echo "✅ Copied: $filename\n";
    } else {
        echo "❌ Failed: $filename\n";
    }
}

echo "\n✨ All images copied to public/images/items/\n";
?>
