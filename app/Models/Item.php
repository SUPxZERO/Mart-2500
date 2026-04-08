<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Item extends Model
{
    protected $fillable = [
        'name',
        'default_cost',
        'default_price',
        'category',
        'image_path',
        'is_active',
    ];

    protected $casts = [
        'default_cost'  => 'integer',
        'default_price' => 'integer',
        'is_active'     => 'boolean',
    ];

    protected $appends = ['image_url'];

    /**
     * Return the public URL for the product image, or null if none.
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path
            ? Storage::disk('public')->url($this->image_path)
            : null;
    }

    /**
     * Scope to only return active items for the POS grid.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
