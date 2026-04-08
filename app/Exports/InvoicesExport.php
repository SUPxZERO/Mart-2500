<?php

namespace App\Exports;

use App\Models\InvoiceItem;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;

class InvoicesExport implements FromQuery, WithMapping, WithHeadings
{
    public function query()
    {
        return InvoiceItem::query()->with([
            'invoice.customer'
        ])->latest('id');
    }

    public function headings(): array
    {
        return [
            'Invoice Number',
            'Date',
            'Customer',
            'Payment Method',
            'Status',
            'Item Name',
            'Quantity',
            'Unit Price (KHR)',
            'Line Total (KHR)',
            'Invoice Total (KHR)',
        ];
    }

    public function map($item): array
    {
        $invoice = $item->invoice;
        
        return [
            $invoice->invoice_number,
            $invoice->created_at->format('Y-m-d H:i:s'),
            $invoice->customer ? $invoice->customer->name : 'Walk-in Customer',
            $invoice->payment_method,
            $invoice->status,
            $item->item_name,
            $item->qty,
            $item->custom_price_sold_at,
            $item->custom_price_sold_at * $item->qty,
            $invoice->total_khr,
        ];
    }
}
