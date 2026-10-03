import { NextResponse } from 'next/server';
import { getMedicinesByPersonId, upsertMedicine } from '@/lib/db';

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

    const medicines = getMedicinesByPersonId(personId);
    return NextResponse.json({ medicines });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch medicines' }, { status: 500 });
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

    const body = await req.json();
    const { name, dosage, frequency } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Medicine name is required' }, { status: 400 });
    }

    const medicine = upsertMedicine(
      personId,
      name.trim(),
      dosage ? String(dosage).trim() : null,
      frequency ? String(frequency).trim() : null
    );

    return NextResponse.json({ success: true, medicine });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add medicine' }, { status: 500 });
  }
}
