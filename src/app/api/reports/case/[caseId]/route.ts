import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { getCaseById } from '@/app/api/_lib/data';
import { generateCaseAnalysis } from '@/services/ai-analysis-service';
import { CaseReportDocument } from '@/lib/pdf/case-report-template';
import { err } from '@/app/api/_lib/response';

export const maxDuration = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const { caseId } = await params;
  const caseData = getCaseById(caseId);

  if (!caseData) {
    return err('Case not found', 404);
  }

  const analysis = generateCaseAnalysis(caseData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    React.createElement(CaseReportDocument, { caseData, analysis }) as any,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="PolitiTrace-${caseId}-Report.pdf"`,
    },
  });
}
