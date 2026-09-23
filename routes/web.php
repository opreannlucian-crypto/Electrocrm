<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CompanyProfileController;
use App\Http\Controllers\ApplicationSettingController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\ContractTemplateController;
use App\Http\Controllers\ConsumptionNoteController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardActivityController;
use App\Http\Controllers\ActivityJournalReportController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDocumentController;
use App\Http\Controllers\FreeReportController;
use App\Http\Controllers\FreeReportTemplateController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\ReceiptReportController;
use App\Http\Controllers\StockReportController;
use App\Http\Controllers\SpvInboxController;
use App\Http\Controllers\MinutesReportController;
use App\Http\Controllers\ContractsReportController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplierPaymentController;
use App\Http\Controllers\SupplierBalanceReportController;
use App\Http\Controllers\ReceptionController;
use App\Http\Controllers\InvoiceReportController;
use App\Http\Controllers\CashRegisterReportController;
use App\Http\Controllers\OblioIntegrationController;
use App\Http\Controllers\OperationalReportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationHistoryController;
use App\Http\Controllers\NotificationSettingsController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\QuoteTemplateController;
use App\Http\Controllers\SalarySlipController;
use App\Http\Controllers\WorkOrderController;
use App\Http\Controllers\WordExportController;
use App\Http\Controllers\WorkOrderTimeEntryController;
use App\Http\Controllers\TechnicianHoursReportController;
use App\Http\Controllers\TransferNoteController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Pagina principala
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('dashboard');
});

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', [
    DashboardController::class,
    'index',
])
    ->middleware([
        'auth',
        'verified',
        'module:dashboard',
    ])
    ->name('dashboard');

Route::post('/dashboard/activities', [DashboardActivityController::class, 'store'])
    ->middleware(['auth', 'verified', 'module:dashboard'])
    ->name('dashboard.activities.store');
Route::patch('/dashboard/activities/{dashboardActivity}', [DashboardActivityController::class, 'update'])
    ->middleware(['auth', 'verified', 'module:dashboard'])
    ->name('dashboard.activities.update');

/*
|--------------------------------------------------------------------------
| Rute autentificate
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth',
    'verified',
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Calendar
    |--------------------------------------------------------------------------
    */

    Route::get('/calendar', [
        CalendarController::class,
        'index',
    ])->middleware('module:calendar')->name('calendar.index');

    Route::get('/spv', [SpvInboxController::class, 'index'])
        ->middleware('module:invoices')
        ->name('spv.index');

    /*
    |--------------------------------------------------------------------------
    | Prezenta / Pontaj
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'attendance',
        AttendanceController::class
    )->middleware('module:attendance');

    Route::post(
        '/attendance/bulk-store',
        [
            AttendanceController::class,
            'bulkStore',
        ]
    )->middleware('module:attendance')->name('attendance.bulkStore');

    Route::get(
        '/attendance/export/excel',
        [
            AttendanceController::class,
            'exportExcel',
        ]
    )->middleware('module:attendance')->name('attendance.export.excel');

    Route::get(
        '/attendance/export/pdf',
        [
            AttendanceController::class,
            'exportPdf',
        ]
    )->middleware('module:attendance')->name('attendance.export.pdf');

    /*
    |--------------------------------------------------------------------------
    | Salarii și fluturași
    |--------------------------------------------------------------------------
    */

    Route::get('/salary-slips', [SalarySlipController::class, 'index'])->name('salary-slips.index');
    Route::get('/salary-slips/create', [SalarySlipController::class, 'create'])->name('salary-slips.create');
    Route::post('/salary-slips', [SalarySlipController::class, 'store'])->name('salary-slips.store');
    Route::get('/salary-slips/{salarySlip}', [SalarySlipController::class, 'show'])->name('salary-slips.show');
    Route::get('/salary-slips/{salarySlip}/edit', [SalarySlipController::class, 'edit'])->name('salary-slips.edit');
    Route::post('/salary-slips/{salarySlip}/rectify', [SalarySlipController::class, 'rectify'])->name('salary-slips.rectify');
    Route::put('/salary-slips/{salarySlip}', [SalarySlipController::class, 'update'])->name('salary-slips.update');
    Route::post('/salary-slips/{salarySlip}/finalize', [SalarySlipController::class, 'finalize'])->name('salary-slips.finalize');
    Route::get('/salary-slips/{salarySlip}/pdf', [SalarySlipController::class, 'pdf'])->name('salary-slips.pdf');
    Route::get('/salary-slips/attendance-preview/{employee}', [SalarySlipController::class, 'attendancePreview'])->name('salary-slips.attendance-preview');
    Route::get('/reports/technician-hours', [TechnicianHoursReportController::class, 'index'])->middleware('module:attendance')->name('reports.technician-hours.index');
    Route::get('/reports/activity-journal', [ActivityJournalReportController::class, 'index'])->middleware('module:dashboard')->name('reports.activity-journal.index');

    /*
    |--------------------------------------------------------------------------
    | Profil
    |--------------------------------------------------------------------------
    */

    Route::get('/company-profile', [CompanyProfileController::class, 'edit'])->middleware('admin')->name('company-profile.edit');
    Route::put('/company-profile', [CompanyProfileController::class, 'update'])->middleware('admin')->name('company-profile.update');
    Route::get('/settings/{section}', [ApplicationSettingController::class, 'edit'])->name('settings.edit');
    Route::put('/settings/{section}', [ApplicationSettingController::class, 'update'])->name('settings.update');

    Route::get('/notifications/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::get('/notifications/history', [NotificationHistoryController::class, 'index'])->middleware('admin')->name('notifications.history');
    Route::get('/notification-settings', [NotificationSettingsController::class, 'index'])->middleware('admin')->name('notification-settings.index');
    Route::put('/notification-settings', [NotificationSettingsController::class, 'update'])->middleware('admin')->name('notification-settings.update');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');

    Route::get('/profile', [
        ProfileController::class,
        'edit',
    ])->name('profile.edit');

    Route::patch('/profile', [
        ProfileController::class,
        'update',
    ])->name('profile.update');

    Route::delete('/profile', [
        ProfileController::class,
        'destroy',
    ])->name('profile.destroy');

    /*
    |--------------------------------------------------------------------------
    | Clienti
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/clients/verify-cui',
        [
            ClientController::class,
            'verifyCui',
        ]
    )->middleware('module:client_creation')->name('clients.verify-cui');

    Route::get('/clients/create', [
        ClientController::class,
        'create',
    ])->middleware('module:client_creation')->name('clients.create');

    Route::post('/clients', [
        ClientController::class,
        'store',
    ])->middleware('module:client_creation')->name('clients.store');

    Route::resource(
        'clients',
        ClientController::class
    )->except(['create', 'store'])->middleware('module:clients');

    Route::post('/clients/{client}/documents', [ClientController::class, 'storeDocument'])->middleware('module:clients')->name('clients.documents.store');
    Route::get('/clients/{client}/documents/{document}/download', [ClientController::class, 'downloadDocument'])->middleware('module:clients')->name('clients.documents.download');
    Route::delete('/clients/{client}/documents/{document}', [ClientController::class, 'destroyDocument'])->middleware('module:clients')->name('clients.documents.destroy');

    /*
    |--------------------------------------------------------------------------
    | Angajati
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'employees',
        EmployeeController::class
    )->middleware('module:employees');

    /*
    |--------------------------------------------------------------------------
    | Documente angajat
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | Creare cerere de concediu
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/employees/{employee}/documents/leave-request/create',
        [
            EmployeeDocumentController::class,
            'createLeaveRequest',
        ]
    )->middleware('module:employees')->name(
        'employees.documents.leave-request.create'
    );

    /*
    |--------------------------------------------------------------------------
    | Generare cerere de concediu PDF
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/employees/{employee}/documents/leave-request',
        [
            EmployeeDocumentController::class,
            'storeLeaveRequest',
        ]
    )->middleware('module:employees')->name(
        'employees.documents.leave-request.store'
    );

    /*
    |--------------------------------------------------------------------------
    | Creare cerere demisie / incetare
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/employees/{employee}/documents/termination-request/create',
        [
            EmployeeDocumentController::class,
            'createTerminationRequest',
        ]
    )->middleware('module:employees')->name(
        'employees.documents.termination-request.create'
    );

    /*
    |--------------------------------------------------------------------------
    | Generare cerere demisie / incetare PDF
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/employees/{employee}/documents/termination-request',
        [
            EmployeeDocumentController::class,
            'storeTerminationRequest',
        ]
    )->middleware('module:employees')->name(
        'employees.documents.termination-request.store'
    );

    /*
    |--------------------------------------------------------------------------
    | Incarcare document existent
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/employees/{employee}/documents',
        [
            EmployeeDocumentController::class,
            'store',
        ]
    )->middleware('module:employees')->name(
        'employees.documents.store'
    );

    /*
    |--------------------------------------------------------------------------
    | Descarcare document
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/employees/{employee}/documents/{employeeDocument}/download',
        [
            EmployeeDocumentController::class,
            'download',
        ]
    )->middleware('module:employees')->name(
        'employees.documents.download'
    );

    /*
    |--------------------------------------------------------------------------
    | Stergere document
    |--------------------------------------------------------------------------
    */

    Route::delete(
        '/employees/{employee}/documents/{employeeDocument}',
        [
            EmployeeDocumentController::class,
            'destroy',
        ]
    )->middleware('module:employees')->name(
        'employees.documents.destroy'
    );

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'customers',
        CustomerController::class
    )->middleware('module:customers');

    /*
    |--------------------------------------------------------------------------
    | Produse
    |--------------------------------------------------------------------------
    */

    Route::post('products/import', [ProductController::class, 'import'])
        ->middleware('module:products')
        ->name('products.import');

    Route::resource(
        'products',
        ProductController::class
    )->middleware('module:products');
    Route::resource('services', ServiceController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('module:products');
    Route::resource('product-categories', ProductCategoryController::class)->only(['index', 'store', 'update'])->middleware('module:products');
    Route::resource('stock-movements', StockMovementController::class)
        ->only(['index', 'create', 'store', 'show', 'destroy'])
        ->parameters(['stock-movements' => 'stockMovement'])
        ->middleware('module:products');

    /*
    |--------------------------------------------------------------------------
    | Jobs
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'jobs',
        JobController::class
    )->middleware('module:jobs');

    /*
    |--------------------------------------------------------------------------
    | LUCRARI
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'work_orders',
        WorkOrderController::class
    )->only(['index', 'show', 'create', 'store'])->middleware('module:work_orders');

    Route::resource(
        'work_orders',
        WorkOrderController::class
    )->only(['edit', 'update', 'destroy'])->middleware('module:work_orders');

    /*
    |--------------------------------------------------------------------------
    | PONTAJ PE LUCRARE
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/work_orders/{workOrder}/time/start',
        [
            WorkOrderTimeEntryController::class,
            'start',
        ]
    )->middleware('module:work_orders')->name('work_orders.time.start');

    Route::post(
        '/work_orders/{workOrder}/time/stop',
        [
            WorkOrderTimeEntryController::class,
            'stop',
        ]
    )->middleware('module:work_orders')->name('work_orders.time.stop');

    Route::get(
        '/work_orders/{workOrder}/time',
        [
            WorkOrderTimeEntryController::class,
            'index',
        ]
    )->middleware('module:work_orders')->name('work_orders.time.index');

    Route::put(
        '/work_orders/{workOrder}/time/{timeEntry}',
        [WorkOrderTimeEntryController::class, 'update']
    )->middleware('module:work_orders')->name('work_orders.time.update');

    Route::post(
    '/attendance/start-day',
    [AttendanceController::class, 'startDay']
)->middleware('module:attendance')->name('attendance.startDay');

Route::post(
    '/attendance/stop-day',
    [AttendanceController::class, 'stopDay']
)->middleware('module:attendance')->name('attendance.stopDay');

    /*
    |--------------------------------------------------------------------------
    | FOTOGRAFII LUCRARE
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/work_orders/{workOrder}/photos',
        [
            WorkOrderController::class,
            'storePhoto',
        ]
    )->middleware('module:work_orders')->name('work_orders.photos.store');

    Route::delete(
        '/work_orders/{workOrder}/photos/{photo}',
        [
            WorkOrderController::class,
            'destroyPhoto',
        ]
    )->middleware('module:work_orders')->name('work_orders.photos.destroy');

    Route::post('/work_orders/{workOrder}/documents', [WorkOrderController::class, 'storeDocument'])->middleware('module:work_orders')->name('work_orders.documents.store');
    Route::get('/work_orders/{workOrder}/documents/{document}/download', [WorkOrderController::class, 'downloadDocument'])->middleware('module:work_orders')->name('work_orders.documents.download');
    Route::delete('/work_orders/{workOrder}/documents/{document}', [WorkOrderController::class, 'destroyDocument'])->middleware('module:work_orders')->name('work_orders.documents.destroy');

    /*
    |--------------------------------------------------------------------------
    | Status rapid lucrare
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/work_orders/{workOrder}/status',
        [
            WorkOrderController::class,
            'updateStatus',
        ]
    )->middleware('module:work_orders')->name('work_orders.status');

    /*
    |--------------------------------------------------------------------------
    | Proces-verbal din lucrare
    |--------------------------------------------------------------------------
    */

    Route::match(
        ['get', 'post'],
        '/work_orders/{workOrder}/report',
        [
            WorkOrderController::class,
            'report',
        ]
    )->middleware('module:work_orders')->name('work_orders.report');

    /*
    |--------------------------------------------------------------------------
    | QR lucrare
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/work_orders/{workOrder}/qr',
        [
            WorkOrderController::class,
            'qr',
        ]
    )->middleware('module:work_orders')->name('work_orders.qr');

    /*
    |--------------------------------------------------------------------------
    | Scanare QR
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/work_orders/{workOrder}/scan',
        [
            WorkOrderController::class,
            'scan',
        ]
    )
        ->middleware(['signed', 'module:work_orders'])
        ->name('work_orders.scan');

    /*
    |--------------------------------------------------------------------------
    | PROCESE-VERBALE GENERALE
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'reports',
        FreeReportController::class
    )->parameters([
        'reports' => 'freeReport',
    ])->middleware('module:reports');
    Route::get('/report-templates', [FreeReportTemplateController::class, 'index'])->middleware('module:reports')->name('report-templates.index');
    Route::post('/reports/{report}/save-template', [FreeReportTemplateController::class, 'storeFromReport'])->middleware('module:reports')->name('reports.save-template');
    Route::delete('/report-templates/{freeReportTemplate}', [FreeReportTemplateController::class, 'destroy'])->middleware('module:reports')->name('report-templates.destroy');
    Route::get('/contracts/{contract}/word', [WordExportController::class, 'contract'])->middleware('module:contracts')->name('contracts.word');
    Route::get('/reports/{report}/word', [WordExportController::class, 'report'])->middleware('module:reports')->name('reports.word');
    Route::get('/report-templates/{freeReportTemplate}/word', [WordExportController::class, 'template'])->middleware('module:reports')->name('report-templates.word');

    /*
    |--------------------------------------------------------------------------
    | PDF PROCES-VERBAL
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/reports/{freeReport}/pdf',
        [
            FreeReportController::class,
            'pdf',
        ]
    )->middleware('module:reports')->name('reports.pdf');

    /*
    |--------------------------------------------------------------------------
    | CONTRACTE
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | Creare contract din sablon
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/contracts/create-from-template/{contractTemplate}',
        [
            ContractController::class,
            'createFromTemplate',
        ]
    )->middleware('module:contracts')->name(
        'contracts.create-from-template'
    );

    /*
    |--------------------------------------------------------------------------
    | Creare contract prin copiere directa a sablonului
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/contract-templates/{contractTemplate}/duplicate',
        [
            ContractController::class,
            'duplicateFromTemplate',
        ]
    )->middleware('module:contracts')->name(
        'contract-templates.duplicate'
    );

    /*
    |--------------------------------------------------------------------------
    | PDF CONTRACT
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/contracts/{contract}/pdf',
        [
            ContractController::class,
            'pdf',
        ]
    )->middleware('module:contracts')->name(
        'contracts.pdf'
    );

    /*
    |--------------------------------------------------------------------------
    | Contracte
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'contracts',
        ContractController::class
    )->middleware('module:contracts');

    /*
    |--------------------------------------------------------------------------
    | SABLOANE CONTRACTE
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'contract-templates',
        ContractTemplateController::class
    )->parameters([
        'contract-templates' =>
            'contractTemplate',
    ])->middleware('module:contracts');

    /*
    |--------------------------------------------------------------------------
    | OFERTE / DEVIZE
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/quotes/create-deviz',
        [
            QuoteController::class,
            'createDeviz',
        ]
    )->middleware('module:quotes')->name('quotes.create-deviz');
    Route::get('/quote-templates', [QuoteTemplateController::class, 'index'])->middleware('module:quotes')->name('quote-templates.index');
    Route::get('/quote-templates/create', [QuoteController::class, 'create'])->middleware('module:quotes')->name('quote-templates.create');
    Route::post('/quote-templates', [QuoteTemplateController::class, 'store'])->middleware('module:quotes')->name('quote-templates.store');
    Route::post('/quotes/{quote}/save-template', [QuoteTemplateController::class, 'storeFromQuote'])->middleware('module:quotes')->name('quotes.save-template');
    Route::delete('/quote-templates/{quoteTemplate}', [QuoteTemplateController::class, 'destroy'])->middleware('module:quotes')->name('quote-templates.destroy');

    Route::resource(
        'quotes',
        QuoteController::class
    )->middleware('module:quotes');

    Route::resource('warehouses', WarehouseController::class)->only(['index','store','update','destroy'])->middleware('module:products');
    Route::get('/consumption-notes', [ConsumptionNoteController::class, 'index'])->middleware('module:products')->name('consumption-notes.index');
    Route::get('/consumption-notes/create', [ConsumptionNoteController::class, 'create'])->middleware('module:products')->name('consumption-notes.create');
    Route::post('/consumption-notes', [ConsumptionNoteController::class, 'store'])->middleware('module:products')->name('consumption-notes.store');
    Route::get('/consumption-notes/{consumptionNote}/pdf', [ConsumptionNoteController::class, 'pdf'])->middleware('module:products')->name('consumption-notes.pdf');
    Route::get('/consumption-notes/{consumptionNote}/edit', [ConsumptionNoteController::class, 'edit'])->middleware('module:products')->name('consumption-notes.edit');
    Route::put('/consumption-notes/{consumptionNote}', [ConsumptionNoteController::class, 'update'])->middleware('module:products')->name('consumption-notes.update');
    Route::get('/inventory', [InventoryController::class, 'index'])->middleware('module:products')->name('inventory.index');
    Route::get('/inventory/create', [InventoryController::class, 'create'])->middleware('module:products')->name('inventory.create');
    Route::post('/inventory', [InventoryController::class, 'store'])->middleware('module:products')->name('inventory.store');
    Route::get('/inventory/{inventoryDocument}', [InventoryController::class, 'show'])->middleware('module:products')->name('inventory.show');
    Route::get('/inventory/{inventoryDocument}/pdf', [InventoryController::class, 'pdf'])->middleware('module:products')->name('inventory.pdf');
    Route::post('/inventory/{inventoryDocument}/apply', [InventoryController::class, 'apply'])->middleware('module:products')->name('inventory.apply');
    Route::get('/transfer-notes', [TransferNoteController::class, 'index'])->middleware('module:products')->name('transfer-notes.index');
    Route::get('/transfer-notes/create', [TransferNoteController::class, 'create'])->middleware('module:products')->name('transfer-notes.create');
    Route::post('/transfer-notes', [TransferNoteController::class, 'store'])->middleware('module:products')->name('transfer-notes.store');
    Route::get('/suppliers/lookup-cui', [SupplierController::class, 'lookupCui'])->middleware('module:invoices')->name('suppliers.lookup-cui');
    Route::resource('suppliers', SupplierController::class)->only(['index','store','update'])->middleware('module:invoices');
    Route::get('/supplier-payments', [SupplierPaymentController::class, 'index'])->middleware('module:invoices')->name('supplier-payments.index');
    Route::post('/supplier-payments', [SupplierPaymentController::class, 'store'])->middleware('module:invoices')->name('supplier-payments.store');
    Route::delete('/supplier-payments/{supplierPayment}', [SupplierPaymentController::class, 'destroy'])->middleware('module:invoices')->name('supplier-payments.destroy');
    Route::get('/receptions/report/pdf', [ReceptionController::class, 'reportPdf'])->middleware('module:products')->name('receptions.report-pdf');
    Route::get('/receptions/print-selected', [ReceptionController::class, 'printSelected'])->middleware('module:products')->name('receptions.print-selected');
    Route::resource('receptions', ReceptionController::class)->only(['index','create','store','show','edit','update','destroy'])->middleware('module:products');
    Route::get('/receipts', [ReceiptController::class, 'index'])->middleware('module:invoices')->name('receipts.index');
    Route::post('/receipts', [ReceiptController::class, 'store'])->middleware('module:invoices')->name('receipts.store');
    Route::get('/receipts/{receipt}/pdf', [ReceiptController::class, 'pdf'])->middleware('module:invoices')->name('receipts.pdf');
    Route::delete('/receipts/{receipt}', [ReceiptController::class, 'destroy'])->middleware('module:invoices')->name('receipts.destroy');
    Route::get('/financial-reports/invoices', [InvoiceReportController::class, 'index'])->name('financial-reports.invoices.index');
    Route::get('/financial-reports/suppliers', [SupplierBalanceReportController::class, 'index'])->middleware('module:invoices')->name('financial-reports.suppliers.index');
    Route::get('/financial-reports/receipts', [ReceiptReportController::class, 'index'])->middleware('module:invoices')->name('financial-reports.receipts.index');
    Route::get('/financial-reports/stocks', [StockReportController::class, 'index'])->middleware('module:products')->name('financial-reports.stocks.index');
    Route::get('/financial-reports/minutes', [MinutesReportController::class, 'index'])->middleware('module:reports')->name('financial-reports.minutes.index');
    Route::get('/financial-reports/contracts', [ContractsReportController::class, 'index'])->middleware('module:contracts')->name('financial-reports.contracts.index');
    Route::get('/operational-reports/{kind}', [OperationalReportController::class, 'show'])->middleware('module:invoices')->name('operational-reports.show');
    Route::get('/financial-reports/invoices/excel', [InvoiceReportController::class, 'excel'])->name('financial-reports.invoices.excel');
    Route::get('/financial-reports/invoices/pdf', [InvoiceReportController::class, 'pdf'])->name('financial-reports.invoices.pdf');
    Route::get('/financial-reports/cash-register', [CashRegisterReportController::class, 'index'])->middleware('module:invoices')->name('financial-reports.cash-register.index');
    Route::get('/financial-reports/cash-register/excel', [CashRegisterReportController::class, 'excel'])->middleware('module:invoices')->name('financial-reports.cash-register.excel');
    Route::get('/financial-reports/cash-register/pdf', [CashRegisterReportController::class, 'pdf'])->middleware('module:invoices')->name('financial-reports.cash-register.pdf');
    Route::post('/financial-reports/cash-register/payments', [CashRegisterReportController::class, 'store'])->middleware('module:invoices')->name('financial-reports.cash-register.payments.store');
    Route::post('/financial-reports/cash-register/opening-balance', [CashRegisterReportController::class, 'setOpeningBalance'])->middleware('module:invoices')->name('financial-reports.cash-register.opening-balance.store');
    Route::delete('/financial-reports/cash-register/payments/{cashPayment}', [CashRegisterReportController::class, 'destroy'])->middleware('module:invoices')->name('financial-reports.cash-register.payments.destroy');

    Route::get('/proformas', [InvoiceController::class, 'index'])->middleware('module:invoices')->name('proformas.index');
    Route::get('/proformas/create', [InvoiceController::class, 'create'])->middleware('module:invoices')->name('proformas.create');
    Route::post('/proformas', [InvoiceController::class, 'store'])->middleware('module:invoices')->name('proformas.store');
    Route::post('/invoices/{invoice}/convert-to-invoice', [InvoiceController::class, 'convertToInvoice'])->middleware('module:invoices')->name('invoices.convert');
    Route::resource('invoices', InvoiceController::class)
        ->only(['index', 'create', 'store', 'show', 'edit', 'update'])
        ->middleware('module:invoices');
    Route::post('/oblio/test-connection', [OblioIntegrationController::class, 'testConnection'])->middleware('admin')->name('oblio.test-connection');
    Route::post('/invoices/{invoice}/oblio/issue', [OblioIntegrationController::class, 'issue'])->middleware('module:invoices')->name('invoices.oblio.issue');
    Route::post('/invoices/{invoice}/issue', [InvoiceController::class, 'issue'])->middleware('module:invoices')->name('invoices.issue');
    Route::post('/invoices/{invoice}/payments', [InvoiceController::class, 'addPayment'])->middleware('module:invoices')->name('invoices.payments.store');
    Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'pdf'])->middleware('module:invoices')->name('invoices.pdf');
    Route::post('/invoices/{invoice}/efactura', [InvoiceController::class, 'efactura'])->middleware('module:invoices')->name('invoices.efactura');

    /*
    |--------------------------------------------------------------------------
    | Trimitere oferta
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/quotes/{quote}/send',
        [
            QuoteController::class,
            'send',
        ]
    )->middleware('module:quotes')->name('quotes.send');

    /*
    |--------------------------------------------------------------------------
    | Acceptare oferta
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/quotes/{quote}/accept',
        [
            QuoteController::class,
            'accept',
        ]
    )->middleware('module:quotes')->name('quotes.accept');

    /*
    |--------------------------------------------------------------------------
    | Respingere oferta
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/quotes/{quote}/reject',
        [
            QuoteController::class,
            'reject',
        ]
    )->middleware('module:quotes')->name('quotes.reject');

    /*
    |--------------------------------------------------------------------------
    | Redeschidere oferta / deviz
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/quotes/{quote}/reopen',
        [
            QuoteController::class,
            'reopen',
        ]
    )->middleware('module:quotes')->name('quotes.reopen');

    /*
    |--------------------------------------------------------------------------
    | Finalizare deviz
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/quotes/{quote}/finalize',
        [
            QuoteController::class,
            'finalize',
        ]
    )->middleware('module:quotes')->name('quotes.finalize');

    /*
    |--------------------------------------------------------------------------
    | Creare lucrare din deviz
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/quotes/{quote}/create-work-order',
        [
            QuoteController::class,
            'createWorkOrder',
        ]
    )->middleware('module:quotes')->name('quotes.create-work-order');

    /*
    |--------------------------------------------------------------------------
    | PDF oferta / deviz
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/quotes/{quote}/pdf',
        [
            QuoteController::class,
            'pdf',
        ]
    )->middleware('module:quotes')->name('quotes.pdf');

    Route::resource('users', UserController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        ->middleware('admin');
});

/*
|--------------------------------------------------------------------------
| Autentificare Breeze
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';
