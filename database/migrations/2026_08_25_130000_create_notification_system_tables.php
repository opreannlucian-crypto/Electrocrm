<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_key')->index();
            $table->morphs('subject');
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('payload')->nullable();
            $table->timestamp('occurred_at')->index();
            $table->timestamps();
        });

        Schema::create('notification_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_event_id')->constrained()->cascadeOnDelete();
            $table->nullableMorphs('recipient');
            $table->string('channel')->index();
            $table->string('recipient_address')->nullable();
            $table->string('title');
            $table->text('body');
            $table->string('action_url')->nullable();
            $table->string('status')->default('pending')->index();
            $table->timestamp('scheduled_at')->nullable()->index();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable()->index();
            $table->timestamp('failed_at')->nullable();
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->string('provider_message_id')->nullable();
            $table->text('error_message')->nullable();
            $table->string('dedupe_key')->unique();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['recipient_type', 'recipient_id', 'channel', 'status'], 'notification_deliveries_recipient_status_index');
        });

        Schema::create('notification_rules', function (Blueprint $table) {
            $table->id();
            $table->string('event_key')->index();
            $table->string('audience')->index();
            $table->string('channel')->index();
            $table->boolean('enabled')->default(true);
            $table->string('timing')->default('immediate');
            $table->json('conditions')->nullable();
            $table->string('template_key')->nullable();
            $table->timestamps();

            $table->unique(['event_key', 'audience', 'channel'], 'notification_rules_event_audience_channel_unique');
        });

        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->string('channel');
            $table->string('locale')->default('ro');
            $table->string('subject_template')->nullable();
            $table->text('body_template');
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['key', 'channel', 'locale'], 'notification_templates_key_channel_locale_unique');
        });

        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->morphs('notifiable');
            $table->string('channel')->index();
            $table->string('event_key')->default('*')->index();
            $table->boolean('enabled')->default(true);
            $table->timestamp('consent_at')->nullable();
            $table->string('consent_source')->nullable();
            $table->timestamps();

            $table->unique(['notifiable_type', 'notifiable_id', 'channel', 'event_key'], 'notification_preferences_notifiable_channel_event_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('notification_templates');
        Schema::dropIfExists('notification_rules');
        Schema::dropIfExists('notification_deliveries');
        Schema::dropIfExists('notification_events');
    }
};
