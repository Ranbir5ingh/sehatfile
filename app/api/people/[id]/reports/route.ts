import { NextResponse } from 'next/server';
import {
  getPersonById,
  getReportsByPersonId,
  addReport,
  upsertMedicine,
  updatePersonConditions
} from '@/lib/db';
import { getHealthAI, ExtractedReport } from '@/lib/ai';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const personId = parseInt(id, 10);
    if (isNaN(personId)) {
      return NextResponse.json({ error: 'Invalid person ID' }, { status: 400 });
    }

    const reports = getReportsByPersonId(personId).map((r) => ({
      ...r,
      key_values: JSON.parse(r.key_values_json || '[]')
    }));

    return NextResponse.json({ reports });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const personId = parseInt(id, 10);
    if (isNaN(personId)) {
      return NextResponse.json({ error: 'Invalid person ID' }, { status: 400 });
    }

    const person = getPersonById(personId);
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const body = await req.json();
    const images: string[] = Array.isArray(body.images)
      ? body.images
      : body.image
      ? [body.image]
      : [];

    if (images.length === 0) {
      return NextResponse.json({ error: 'No report image provided' }, { status: 400 });
    }

    const ai = getHealthAI();
    const createdReports = [];
    const extractedList: ExtractedReport[] = [];

    // Current conditions on person
    let currentConditions: string[] = [];
    try {
      currentConditions = JSON.parse(person.conditions_json || '[]');
    } catch {
      currentConditions = [];
    }

    for (const imgDataUrl of images) {
      const extracted = await ai.extractReport(imgDataUrl);
      extractedList.push(extracted);

      // Save report
      const savedReport = addReport(
        personId,
        extracted.reportDate,
        extracted.lab,
        extracted.testName,
        extracted.summary,
        JSON.stringify(extracted.keyValues)
      );

      createdReports.push({
        ...savedReport,
        key_values: extracted.keyValues
      });

      // Fold medicines into living record (upserted by name, reactivated if stopped)
      if (Array.isArray(extracted.medicines)) {
        for (const med of extracted.medicines) {
          if (med.name && med.name.trim().length > 0) {
            upsertMedicine(personId, med.name, med.dosage || null, med.frequency || null);
          }
        }
      }

      // Fold conditions (deduplicated)
      if (Array.isArray(extracted.conditions)) {
        for (const cond of extracted.conditions) {
          const cleanCond = cond.trim();
          if (
            cleanCond &&
            !currentConditions.some((c) => c.toLowerCase() === cleanCond.toLowerCase())
          ) {
            currentConditions.push(cleanCond);
          }
        }
      }
    }

    // Persist updated conditions
    updatePersonConditions(personId, currentConditions);

    return NextResponse.json({
      success: true,
      reports: createdReports,
      conditions: currentConditions
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process and extract report' },
      { status: 500 }
    );
  }
}
