<?php
use Illuminate\Database\Migrations\Migration; use Illuminate\Database\Schema\Blueprint; use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up():void{Schema::create('free_report_templates',function(Blueprint $t){$t->id();$t->string('name',180);$t->json('data');$t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();$t->timestamps();});} public function down():void{Schema::dropIfExists('free_report_templates');} };
