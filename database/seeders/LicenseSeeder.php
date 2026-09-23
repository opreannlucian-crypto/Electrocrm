<?php

namespace Database\Seeders;

use App\Models\License;
use Illuminate\Database\Seeder;

class LicenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        License::updateOrCreate(
            [
                'code' => '4804/T/04.10.2018',
            ],
            [
                'name' => 'Licența 4804/T/04.10.2018',

                'description' =>
                    "sisteme alarmă, supraveghere video\n" .
                    "interfonie, automatizări",

                'image_path' => null,

                'active' => true,

                'sort_order' => 1,
            ]
        );

        License::updateOrCreate(
            [
                'code' => 'B 1940/07.09.2022',
            ],
            [
                'name' => 'Autorizație IGSU: B 1940/07.09.2022',

                'description' =>
                    "Instalare și întreținere sisteme semnalizare\n" .
                    "alarmare și alertare în caz de incendiu",

                'image_path' => null,

                'active' => true,

                'sort_order' => 2,
            ]
        );
    }
}