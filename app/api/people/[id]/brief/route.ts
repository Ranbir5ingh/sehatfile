import { NextResponse } from 'next/server';
import {
  getPersonById,
  getMedicinesByPersonId,
  getReportsByPersonId,
  getLatestBriefByPersonId,
  saveBrief
} from '@/lib/db';
import { getHealthAI, BriefInput } from '@/lib/ai';

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

    const brief = getLatestBriefByPersonId(personId);
    return NextResponse.json({ brief });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch brief' }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
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

    const medicines = getMedicinesByPersonId(personId);
    const reports = getReportsByPersonId(personId);

    const conditions: string[] = JSON.parse(person.conditions_json || '[]');

    const record: BriefInput = {
      name: person.name,
      relation: person.relation,
      conditions,
      medicines: medicines
        .filter((m) => m.active === 1)
        .map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency
        })),
      reports: reports.map((r) => ({
        reportDate: r.report_date,
        testName: r.test_name,
        summary: r.summary,
        keyValues: JSON.parse(r.key_values_json || '[]')
      }))
    };

    const ai = getHealthAI();
    const content = await ai.generateBrief(record);
    const savedBrief = saveBrief(personId, content);

    return NextResponse.json({ success: true, brief: savedBrief });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to generate doctor brief' },
      { status: 500 }
    );
  }
}
