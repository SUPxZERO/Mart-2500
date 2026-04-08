<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Item;
use Inertia\Inertia;
use App\Exports\InvoicesExport;
use Maatwebsite\Excel\Facades\Excel;

class InvoiceController extends Controller
{
    /**
     * Display a paginated list of all invoices.
     */
    public function index()
    {
        $invoices = Invoice::with('customer')
            ->latest()
            ->paginate(50);

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices
        ]);
    }

    /**
     * Display the specified invoice with its items for the modal view.
     */
    public function show(Invoice $invoice)
    {
        $invoice->load(['items', 'customer']);

        // Attach image_urls to items by matching item_name
        $itemNames = $invoice->items->pluck('item_name')->toArray();
        $images = Item::whereIn('name', $itemNames)->pluck('image_url', 'name');
        
        $invoice->items->each(function ($item) use ($images) {
            $item->image_url = $images[$item->item_name] ?? null;
        });

        return response()->json([
            'invoice' => $invoice
        ]);
    }

    /**
     * Display the specified invoice as a full A4 printable page.
     */
    public function showPage(Invoice $invoice)
    {
        $invoice->load(['items', 'customer']);

        // Attach image_urls to items by matching item_name
        $itemNames = $invoice->items->pluck('item_name')->toArray();
        $images = Item::whereIn('name', $itemNames)->pluck('image_url', 'name');
        
        $invoice->items->each(function ($item) use ($images) {
            $item->image_url = $images[$item->item_name] ?? null;
        });

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice
        ]);
    }

    /**
     * Export all invoices as an Excel file.
     */
    public function export()
    {
        return Excel::download(new InvoicesExport, 'mart2500-invoices-' . date('Y-m-d') . '.xlsx');
    }
}
