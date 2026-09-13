<?php

namespace App\Http\Controllers;

use App\Actions\Reports\GenerateReportExport;
use App\Http\Requests\ExportReportRequest;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class ExportReportController extends Controller
{
    public function store(
        ExportReportRequest $request,
        GenerateReportExport $generateReportExport,
    ): Response {
        /** @var User $user */
        $user = $request->user();
        $file = $generateReportExport->handle(
            $user,
            $request->exportFormat(),
            $request->filters(),
        );

        return response($file->contents, Response::HTTP_OK, [
            'Content-Type' => $file->mimeType,
            'Content-Disposition' => 'attachment; filename="'.$file->fileName.'"',
            'Content-Length' => (string) strlen($file->contents),
            'Cache-Control' => 'private, no-store, max-age=0',
        ]);
    }
}
