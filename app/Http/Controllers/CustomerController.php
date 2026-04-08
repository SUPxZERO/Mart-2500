<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class CustomerController extends Controller
{
    /**
     * Display a listing of all customers.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $customers = Customer::when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('phone_number', 'like', "%{$search}%");
            })
            // Sort customers with highest debt first
            ->orderByDesc('total_debt_balance')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => ['search' => $search]
        ]);
    }

    /**
     * Display the specific customer profile with a unified timeline of transactions.
     */
    public function show(Customer $customer)
    {
        // Fetch all their invoices and payments to build a timeline
        $invoices = $customer->invoices()
            ->latest()
            ->get()
            ->map(function ($inv) {
                return [
                    'id' => 'inv-'.$inv->id,
                    'type' => 'invoice',
                    'date' => $inv->created_at,
                    'amount' => $inv->total_khr,
                    'status' => $inv->status,
                    'invoice_number' => $inv->invoice_number
                ];
            });

        $payments = $customer->payments()
            ->latest()
            ->get()
            ->map(function ($pay) {
                return [
                    'id' => 'pay-'.$pay->id,
                    'type' => 'payment',
                    'date' => $pay->created_at,
                    'amount' => $pay->amount_paid_khr,
                    'method' => $pay->payment_method
                ];
            });

        // Merge and sort descendant
        $timeline = collect($invoices)
            ->merge($payments)
            ->sortByDesc('date')
            ->values();

        // ── Spending Analytics ──────────────────────────────────────────
        $now = Carbon::now();
        $spending = [
            'this_week' => (int) $customer->invoices()
                ->where('created_at', '>=', $now->copy()->startOfWeek())
                ->where('status', 'Completed')
                ->sum('total_khr'),

            'this_month' => (int) $customer->invoices()
                ->where('created_at', '>=', $now->copy()->startOfMonth())
                ->where('status', 'Completed')
                ->sum('total_khr'),

            'this_year' => (int) $customer->invoices()
                ->where('created_at', '>=', $now->copy()->startOfYear())
                ->where('status', 'Completed')
                ->sum('total_khr'),

            'lifetime' => (int) $customer->total_lifetime_spent,

            'total_orders' => (int) $customer->invoices()
                ->where('status', 'Completed')
                ->count(),

            'debt_orders' => (int) $customer->invoices()
                ->where('status', 'Added_To_Debt')
                ->count(),

            'avg_order' => (int) $customer->invoices()
                ->where('status', 'Completed')
                ->avg('total_khr'),
        ];

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
            'timeline' => $timeline,
            'spending' => $spending,
        ]);
    }

    /**
     * Process a manual cash or ABA payment from the customer to pay down their debt.
     */
    public function receivePayment(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'amount_khr' => 'required|integer|min:100',
            'payment_method' => 'required|string|in:Cash,ABA,KHQR'
        ]);

        DB::transaction(function () use ($validated, $customer) {
            // 1. Log the payment safely
            Payment::create([
                'customer_id' => $customer->id,
                'amount_paid_khr' => $validated['amount_khr'],
                'payment_method' => $validated['payment_method'],
            ]);

            // 2. Reduce the customer's debt safely
            // Note: If debt goes below zero, the system seamlessly treats it as store credit
            $customer->decrement('total_debt_balance', $validated['amount_khr']);
            
            // 3. Optional: we can increment their lifetime spent, or only do that at invoice generation.
            // A logical choice is only counting invoices as lifetime spent.
        });

        return back()->with('success', 'Payment received successfully!');
    }
}
