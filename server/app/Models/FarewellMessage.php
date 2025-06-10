<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarewellMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'message',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public static function getRandomActiveMessage(): ?string
    {
        $message = self::where('is_active', true)
            ->inRandomOrder()
            ->first();

        return $message ? $message->message : null;
    }
}