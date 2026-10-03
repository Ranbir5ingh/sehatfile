import { NextResponse } from 'next/server';
import { toggleMedicineActive } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const medicineId = parseInt(id, 10);
    if (isNaN(medicineId)) {
      return NextResponse.json({ error: 'Invalid medicine ID' }, { status: 400 });
    }

    const body = await req.json();
    const active = body.active ? 1 : 0;

    const updated = toggleMedicineActive(medicineId, active);
    if (!updated) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, medicine: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update medicine status' },
      { status: 500 }
    );
  }
}
