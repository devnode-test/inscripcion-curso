import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      name: string;
      description?: string;
      room?: string;
      max_capacity: number;
    };
    const { name, description, room, max_capacity } = body;

    // 1. Create Course
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .insert([{
        name,
        description,
        room,
        max_capacity,
        is_active: true
      }])
      .select()
      .single();

    if (courseError) throw courseError;

    // 2. Create Blocks (A and B)
    const { error: blocksError } = await supabaseAdmin
      .from('course_blocks')
      .insert([
        {
          course_id: course.id,
          block_name: 'A',
          available_slots: max_capacity,
          total_capacity: max_capacity
        },
        {
          course_id: course.id,
          block_name: 'B',
          available_slots: max_capacity,
          total_capacity: max_capacity
        }
      ]);

    if (blocksError) throw blocksError;

    return NextResponse.json(course);
  } catch (error: unknown) {
    console.error('Error creating course:', error);
    const message = error instanceof Error ? error.message : 'Error creating course';
    return NextResponse.json({ message }, { status: 500 });
  }
}
