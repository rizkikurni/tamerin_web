<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Queries\Dashboard\SystemReminderQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemReminderController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        SystemReminderQuery $query,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $reminders = $query->get($user, today());

        return response()->json([
            'reminders' => $reminders,
            'count' => count($reminders),
        ]);
    }
}
