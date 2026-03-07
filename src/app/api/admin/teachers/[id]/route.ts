import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      name: string;
      email: string;
      is_active: boolean;
    };
    const { name, email, is_active } = body;

    const { data: teacher, error } = await supabaseAdmin
      .from('teachers')
      .update({
        name,
        email,
        is_active
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(teacher);
  } catch (error: unknown) {
    console.error('Error updating teacher:', error);
    const message = error instanceof Error ? error.message : 'Error updating teacher';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Delete related records first if not handled by CASCADE
    // Check if there are registrations
    // Usually registrations reference teacher_id. If schema has ON DELETE CASCADE, it's fine.
    // If not, we might need to delete registrations manually.
    // Let's assume schema handles it or we try to delete and catch error.
    
    // In our initial schema:
    // teacher_id UUID REFERENCES teachers(id) (no cascade specified)
    // So we should delete registrations first.
    
    // Find registrations for this teacher
    const { data: registrations } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('teacher_id', id);

    if (registrations && registrations.length > 0) {
      const regIds = registrations.map(r => r.id);
      
      // Delete selected_courses for these registrations
      await supabaseAdmin
        .from('selected_courses')
        .delete()
        .in('registration_id', regIds);
        
      // Delete registrations
      await supabaseAdmin
        .from('registrations')
        .delete()
        .eq('teacher_id', id);
    }

    const { error } = await supabaseAdmin
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting teacher:', error);
    const message = error instanceof Error ? error.message : 'Error deleting teacher';
    return NextResponse.json({ message }, { status: 500 });
  }
}
