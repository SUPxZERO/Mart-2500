<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/pos');

// Item Management (CRUD)
Route::resource('items', \App\Http\Controllers\ItemController::class)
    ->except(['show']);
Route::patch('/items/{item}/restore', [\App\Http\Controllers\ItemController::class, 'restore'])->name('items.restore');

// Category Management
Route::resource('categories', \App\Http\Controllers\CategoryController::class)->except(['create', 'show', 'edit']);
Route::get('/api/categories', [\App\Http\Controllers\CategoryController::class, 'apiIndex']);
Route::post('/api/categories', [\App\Http\Controllers\CategoryController::class, 'store']);

Route::get('/pos', function () {
    return Inertia::render('POS/Index', [
        'items'         => \App\Models\Item::active()->orderBy('category')->orderBy('name')->get(),
        'customers'     => \App\Models\Customer::orderBy('name')->get(),
        'exchange_rate' => \App\Models\ExchangeRate::first(),
    ]);
})->name('pos');

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
Route::get('/settings/backup', [\App\Http\Controllers\SettingsController::class, 'downloadBackup']);

// Backend transaction layer
Route::post('/api/invoices', [\App\Http\Controllers\Api\InvoiceController::class, 'store']);

require __DIR__.'/auth.php';
