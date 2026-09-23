<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'oblio' => [
        'email' => env('OBLIO_EMAIL'),
        'secret' => env('OBLIO_SECRET'),
        'cif' => env('OBLIO_CIF'),
        'invoice_series' => env('OBLIO_INVOICE_SERIES'),
        'sync_enabled' => env('OBLIO_SYNC_ENABLED', false),
        'spv_extern' => env('OBLIO_SPV_EXTERN', true),
        'timeout' => env('OBLIO_TIMEOUT', 20),
        'retry_times' => env('OBLIO_RETRY_TIMES', 2),
    ],

    'efactura' => [
        'environment' => env('EFAC_ENVIRONMENT', 'test'),
        'token' => env('EFAC_TOKEN'),
        'cif' => env('EFAC_CIF'),
        'seller_name' => env('EFAC_SELLER_NAME'),
        'seller_address' => env('EFAC_SELLER_ADDRESS'),
        'seller_iban' => env('EFAC_SELLER_IBAN'),
        'seller_bank' => env('EFAC_SELLER_BANK'),
    ],

];
