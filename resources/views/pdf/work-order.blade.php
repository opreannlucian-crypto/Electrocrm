<!DOCTYPE html>
<html lang="ro">

<head>

    <meta charset="UTF-8">

    <style>

        @page {
            margin: 35px 35px 40px 35px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #222;
        }

        h1 {
            text-align: center;
            font-size: 22px;
            margin-bottom: 5px;
        }

        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 25px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }

        td {
            border: 1px solid #d1d5db;
            padding: 7px;
            vertical-align: top;
        }

        .title {
            width: 180px;
            background: #f3f4f6;
            font-weight: bold;
        }

        .section {
            background: #0f62fe;
            color: white;
            padding: 8px;
            margin-top: 20px;
            margin-bottom: 8px;
            font-weight: bold;
            font-size: 12px;
        }

        .description {
            min-height: 50px;
        }

        .photo-section {
            page-break-inside: avoid;
            margin-top: 20px;
        }

        .photo-title {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 8px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .photo-table {
            width: 100%;
            border-collapse: collapse;
        }

        .photo-table td {
            width: 50%;
            border: none;
            text-align: center;
            padding: 5px;
            vertical-align: top;
        }

        .photo {
            width: 230px;
            height: 170px;
            object-fit: cover;
            border: 1px solid #ccc;
        }

        .photo-name {
            font-size: 8px;
            color: #666;
            margin-top: 4px;
        }

        .no-photos {
            border: 1px dashed #aaa;
            padding: 15px;
            text-align: center;
            color: #777;
        }

        .signature {
            margin-top: 70px;
        }

        .signature td {
            border: none;
            text-align: center;
            width: 50%;
        }

        .footer {
            margin-top: 25px;
            text-align: center;
            font-size: 9px;
            color: #777;
        }

    </style>

</head>


<body>


<h1>FIȘĂ DE INTERVENȚIE</h1>

<div class="subtitle">
    {{ $workOrder->number }}
</div>


<!-- DATE LUCRARE -->

<div class="section">
    Date lucrare
</div>

<table>

    <tr>
        <td class="title">Număr lucrare</td>
        <td>{{ $workOrder->number }}</td>
    </tr>

    <tr>
        <td class="title">Data programării</td>
        <td>{{ $workOrder->scheduled_date ?? '-' }}</td>
    </tr>

    <tr>
        <td class="title">Ora</td>
        <td>{{ $workOrder->scheduled_time ?? '-' }}</td>
    </tr>

    <tr>
        <td class="title">Tip lucrare</td>
        <td>{{ $workOrder->type ?? '-' }}</td>
    </tr>

    <tr>
        <td class="title">Status</td>
        <td>{{ $workOrder->status ?? '-' }}</td>
    </tr>

    <tr>
        <td class="title">Prioritate</td>
        <td>{{ $workOrder->priority ?? '-' }}</td>
    </tr>

    <tr>
        <td class="title">Adresă intervenție</td>
        <td>{{ $workOrder->address ?? '-' }}</td>
    </tr>

</table>


<!-- CLIENT -->

<div class="section">
    Client
</div>

<table>

    <tr>
        <td class="title">Nume</td>
        <td>{{ $workOrder->client->name ?? '-' }}</td>
    </tr>

    <tr>
        <td class="title">Telefon</td>
        <td>{{ $workOrder->client->phone ?? '-' }}</td>
    </tr>

    <tr>
        <td class="title">Email</td>
        <td>{{ $workOrder->client->email ?? '-' }}</td>
    </tr>

    <tr>
        <td class="title">Adresă client</td>
        <td>{{ $workOrder->client->address ?? '-' }}</td>
    </tr>

</table>


<!-- TEHNICIAN -->

<div class="section">
    Tehnician
</div>

<table>

    <tr>
        <td class="title">Nume</td>
        <td>{{ $workOrder->employee->name ?? '-' }}</td>
    </tr>

    <tr>
        <td class="title">Telefon</td>
        <td>{{ $workOrder->employee->phone ?? '-' }}</td>
    </tr>

</table>


<!-- DESCRIERE -->

<div class="section">
    Descriere intervenție
</div>

<table>

    <tr>
        <td class="description">
            {!! nl2br(e($workOrder->description ?: '-')) !!}
        </td>
    </tr>

</table>


<!-- MATERIALE -->

<div class="section">
    Materiale folosite
</div>

<table>

    <tr>
        <td>
            {!! nl2br(e($workOrder->materials ?: '-')) !!}
        </td>
    </tr>

</table>


<!-- OBSERVATII -->

<div class="section">
    Observații
</div>

<table>

    <tr>
        <td>
            {!! nl2br(e($workOrder->notes ?: '-')) !!}
        </td>
    </tr>

</table>


<!-- FOTOGRAFII INAINTE -->

<div class="photo-section">

    <div class="section">
        Fotografii - Înainte de intervenție
    </div>

    @if($beforePhotos->count() > 0)

        <table class="photo-table">

            <tr>

                @foreach($beforePhotos as $index => $photo)

                    @if($index > 0 && $index % 2 == 0)
                        </tr>
                        <tr>
                    @endif

                    <td>

                        @php
                            $imagePath = storage_path(
                                'app/public/' . $photo->file
                            );

                            $imageData = null;

                            if (file_exists($imagePath)) {
                                $mime = mime_content_type($imagePath);
                                $imageData = 'data:' . $mime . ';base64,' .
                                    base64_encode(file_get_contents($imagePath));
                            }
                        @endphp

                        @if($imageData)

                            <img
                                src="{{ $imageData }}"
                                class="photo"
                            >

                        @endif

                        <div class="photo-name">
                            {{ $photo->original_name ?? 'Fotografie' }}
                        </div>

                    </td>

                @endforeach

            </tr>

        </table>

    @else

        <div class="no-photos">
            Nu există fotografii înainte de intervenție.
        </div>

    @endif

</div>


<!-- FOTOGRAFII DUPA -->

<div class="photo-section">

    <div class="section">
        Fotografii - După intervenție
    </div>

    @if($afterPhotos->count() > 0)

        <table class="photo-table">

            <tr>

                @foreach($afterPhotos as $index => $photo)

                    @if($index > 0 && $index % 2 == 0)
                        </tr>
                        <tr>
                    @endif

                    <td>

                        @php
                            $imagePath = storage_path(
                                'app/public/' . $photo->file
                            );

                            $imageData = null;

                            if (file_exists($imagePath)) {
                                $mime = mime_content_type($imagePath);
                                $imageData = 'data:' . $mime . ';base64,' .
                                    base64_encode(file_get_contents($imagePath));
                            }
                        @endphp

                        @if($imageData)

                            <img
                                src="{{ $imageData }}"
                                class="photo"
                            >

                        @endif

                        <div class="photo-name">
                            {{ $photo->original_name ?? 'Fotografie' }}
                        </div>

                    </td>

                @endforeach

            </tr>

        </table>

    @else

        <div class="no-photos">
            Nu există fotografii după intervenție.
        </div>

    @endif

</div>


<!-- DOCUMENTE -->

@if($documentPhotos->count() > 0)

    <div class="photo-section">

        <div class="section">
            Documente
        </div>

        <table class="photo-table">

            <tr>

                @foreach($documentPhotos as $index => $photo)

                    @if($index > 0 && $index % 2 == 0)
                        </tr>
                        <tr>
                    @endif

                    <td>

                        @php
                            $imagePath = storage_path(
                                'app/public/' . $photo->file
                            );

                            $imageData = null;

                            if (file_exists($imagePath)) {
                                $mime = mime_content_type($imagePath);
                                $imageData = 'data:' . $mime . ';base64,' .
                                    base64_encode(file_get_contents($imagePath));
                            }
                        @endphp

                        @if($imageData)

                            <img
                                src="{{ $imageData }}"
                                class="photo"
                            >

                        @endif

                        <div class="photo-name">
                            {{ $photo->original_name ?? 'Document' }}
                        </div>

                    </td>

                @endforeach

            </tr>

        </table>

    </div>

@endif


<!-- ALTE FOTOGRAFII -->

@if($otherPhotos->count() > 0)

    <div class="photo-section">

        <div class="section">
            Alte fotografii
        </div>

        <table class="photo-table">

            <tr>

                @foreach($otherPhotos as $index => $photo)

                    @if($index > 0 && $index % 2 == 0)
                        </tr>
                        <tr>
                    @endif

                    <td>

                        @php
                            $imagePath = storage_path(
                                'app/public/' . $photo->file
                            );

                            $imageData = null;

                            if (file_exists($imagePath)) {
                                $mime = mime_content_type($imagePath);
                                $imageData = 'data:' . $mime . ';base64,' .
                                    base64_encode(file_get_contents($imagePath));
                            }
                        @endphp

                        @if($imageData)

                            <img
                                src="{{ $imageData }}"
                                class="photo"
                            >

                        @endif

                        <div class="photo-name">
                            {{ $photo->original_name ?? 'Fotografie' }}
                        </div>

                    </td>

                @endforeach

            </tr>

        </table>

    </div>

@endif


<!-- SEMNATURI -->

<table class="signature">

    <tr>

        <td>

            ___________________________<br><br>

            <b>Semnătura tehnicianului</b>

        </td>


        <td>

            ___________________________<br><br>

            <b>Semnătura clientului</b>

        </td>

    </tr>

</table>


<div class="footer">

    Document generat automat pentru lucrarea
    {{ $workOrder->number }}

</div>


</body>

</html>