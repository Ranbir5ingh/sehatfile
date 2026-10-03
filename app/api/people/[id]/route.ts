import { NextResponse } from 'next/server';
import { getPersonById, deletePerson } from '@/lib/db';

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

    const person = getPersonById(personId);
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json({
      person: {
        ...person,
        conditions: JSON.parse(person.conditions_json || '[]') as string[]
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch person' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const personId = parseInt(id, 10);
    if (isNaN(personId)) {
      return NextResponse.json({ error: 'Invalid person ID' }, { status: 400 });
    }

    const deleted = deletePerson(personId);
    if (!deleted) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Person deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete person' }, { status: 500 });
  }
}

