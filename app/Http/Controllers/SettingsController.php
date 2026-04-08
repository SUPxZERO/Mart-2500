<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index', [
            'exchangeRate' => ExchangeRate::first(),
        ]);
    }

    /**
     * Update or create the single exchange rate record.
     */
    public function updateRate(Request $request)
    {
        $validated = $request->validate([
            'usd_to_khr' => 'required|integer|min:3000|max:10000'
        ]);

        ExchangeRate::updateOrCreate(
            ['id' => 1],
            ['usd_to_khr' => $validated['usd_to_khr']]
        );

        return back()->with('success', 'Exchange rate updated successfully!');
    }

    /**
     * Trigger a download of the SQLite database file as a backup.
     */
    public function downloadBackup()
    {
        $dbPath = database_path('database.sqlite');

        if (!file_exists($dbPath)) {
            abort(404, 'Database file not found.');
        }

        $filename = 'mart2500-backup-' . now()->format('Y-m-d_H-i-s') . '.sqlite';

        return response()->download($dbPath, $filename);
    }
}
