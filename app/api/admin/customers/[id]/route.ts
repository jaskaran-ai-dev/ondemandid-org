import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { isAdminAuthenticated } from '@/lib/admin/auth';

const updateSchema = z.object({
  status: z.enum(['pending', 'active', 'inactive']).optional(),
  idConnection: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.idConnection !== undefined)
      updateData.idConnection = data.idConnection;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Update updatedAt
    if (process.env.DB_TYPE === 'neon') {
      updateData.updatedAt = new Date();
    } else {
      updateData.updatedAt = sql`${Math.floor(Date.now() / 1000)}`;
    }

    const isDemoMode = process.env.DEMO_MODE === 'true';
    if (isDemoMode) {
      return NextResponse.json({
        ok: true,
        customer: { id, ...data },
      });
    }

    const updated = await db
      .update(schema.customers)
      .set(updateData)
      .where(eq(schema.customers.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, customer: updated[0] });
  } catch (error) {
    console.error('Admin customer update error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}
