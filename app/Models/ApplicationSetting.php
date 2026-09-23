<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationSetting extends Model
{
    protected $fillable = ['user_id', 'key', 'value'];
    protected $casts = ['value' => 'array'];

    public static function value(string $key, mixed $default = null, ?int $userId = null): mixed
    {
        return static::query()->where('key', $key)->where('user_id', $userId)->value('value') ?? $default;
    }

    public static function put(string $key, mixed $value, ?int $userId = null): void
    {
        static::query()->updateOrCreate(['key' => $key, 'user_id' => $userId], ['value' => $value]);
    }
}
