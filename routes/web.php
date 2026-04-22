<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/pos');

// POS Page - Public, no authentication required
Route::get('/pos', function () {
    \App\Models\PaymentGateway::ensureDefaults();

    return Inertia::render('POS/Index', [
        'items'         => \App\Models\Item::active()->orderBy('category')->orderBy('name')->get(),
        'customers'     => \App\Models\Customer::orderBy('name')->get(),
        'exchange_rate' => \App\Models\ExchangeRate::first(),
        'payment_gateways' => \App\Models\PaymentGateway::where('enabled', true)->orderBy('sort_order')->get(),
    ]);
})->name('pos');

// Public API endpoints for POS
Route::post('/api/invoices', [\App\Http\Controllers\Api\InvoiceController::class, 'store']);

// Image serving route - public
Route::get('/item-image/{path}', [\App\Http\Controllers\ImageController::class, 'serve'])
    ->where('path', '.*')
    ->name('image.serve');

// Dashboard
Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

// Backoffice Invoices List
Route::get('/invoices', [\App\Http\Controllers\InvoiceController::class, 'index'])->name('invoices');
Route::get('/invoices/export', [\App\Http\Controllers\InvoiceController::class, 'export'])->name('invoices.export');
Route::get('/invoices/{invoice}/show', [\App\Http\Controllers\InvoiceController::class, 'showPage'])->name('invoices.show');
Route::get('/invoices/{invoice}', [\App\Http\Controllers\InvoiceController::class, 'show']);

// CRM - Customers
Route::get('/customers', [\App\Http\Controllers\CustomerController::class, 'index'])->name('customers');
Route::get('/customers/{customer}', [\App\Http\Controllers\CustomerController::class, 'show']);
Route::post('/customers/{customer}/payment', [\App\Http\Controllers\CustomerController::class, 'receivePayment']);

// Settings
Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings');
Route::post('/settings/rate', [\App\Http\Controllers\SettingsController::class, 'updateRate']);
Route::post('/settings/payment-methods', [\App\Http\Controllers\SettingsController::class, 'updatePaymentMethods']);
Route::get('/settings/backup', [\App\Http\Controllers\SettingsController::class, 'downloadBackup']);

require __DIR__.'/auth.php';
