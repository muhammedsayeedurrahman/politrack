import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { getComplaintByTrackingCode } from '@/app/api/_lib/data';
import { ComplaintReportDocument } from '@/lib/pdf/complaint-report-template';
import { err } from '@/app/api/_lib/response';

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase();

  if (!code) {
    return err('Tracking code is required', 400);
  }

  const complaint = getComplaintByTrackingCode(code);

  if (!complaint) {
    return err('No report found with this tracking code', 404);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    React.createElement(ComplaintReportDocument, { complaint }) as any,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="PolitiTrace-${code}-Report.pdf"`,
    },
  });
}
