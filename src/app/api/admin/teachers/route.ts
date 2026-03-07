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
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ message: 'Nombre y email son requeridos' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('teachers')
      .insert([{ name, email }])
      .select()
      .single();

    if (error) {
      // Handle unique violation
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Este correo ya está registrado' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { message: 'Error al crear el profesor' },
      { status: 500 }
    );
  }
}
