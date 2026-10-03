import { NextResponse } from 'next/server';
import { getAllPeople, createPerson, clearAllPeople } from '@/lib/db';

export async function GET() {
  try {
    const people = getAllPeople().map((p) => ({
      ...p,
      conditions: JSON.parse(p.conditions_json || '[]') as string[]
    }));
    return NextResponse.json({ people });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch people' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, relation } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const person = createPerson(name.trim(), relation ? String(relation).trim() : '');
    return NextResponse.json({
      person: {
        ...person,
        conditions: JSON.parse(person.conditions_json || '[]') as string[]
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create person' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    clearAllPeople();
    return NextResponse.json({ success: true, message: 'All members cleared' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to clear members' }, { status: 500 });
  }
}

