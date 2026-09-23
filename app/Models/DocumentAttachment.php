<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DocumentAttachment extends Model
{
    protected $fillable = ['original_name', 'path', 'mime_type', 'size', 'uploaded_by'];

    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }
}
