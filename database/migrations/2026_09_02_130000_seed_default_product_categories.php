<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
return new class extends Migration { public function up():void { foreach ([['Materiale','MAT','301','601','701'],['Mărfuri','MAR','371','607','707'],['Obiecte de inventar','OI','303','603','703'],['Servicii','SERV','628','628','704']] as [$name,$code,$stock,$expense,$revenue]) { DB::table('product_categories')->updateOrInsert(['name'=>$name],['code'=>$code,'inventory_account'=>$stock,'expense_account'=>$expense,'revenue_account'=>$revenue,'active'=>true,'created_at'=>now(),'updated_at'=>now()]); } } public function down():void { DB::table('product_categories')->whereIn('code',['MAT','MAR','OI','SERV'])->delete(); } };
