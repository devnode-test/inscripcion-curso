import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('course_id');
  const blockName = searchParams.get('block');

  const supabase = await createClient();

  let query = supabase
    .from('selected_courses')
    .select(`
      course:courses(name),
      block:course_blocks(block_name),
      registration:registrations(
        teacher:teachers(name, email),
        registration_date
      )
    `);

  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  // Filter by block name is tricky because it's in the joined table.
  // Supabase supports filtering on joined tables using inner joins mostly.
  // !inner is the key.
  if (blockName) {
    query = supabase
    .from('selected_courses')
    .select(`
      course:courses(name),
      block:course_blocks!inner(block_name),
      registration:registrations(
        teacher:teachers(name, email),
        registration_date
      )
    `)
    .eq('course_id', courseId!) // Assuming courseId is present if blockName is present based on UI
    .eq('block.block_name', blockName);
  }

  const { data, error } = await query;

  if (error) {
    return new NextResponse('Error fetching data', { status: 500 });
  }

  // Convert to CSV
  const csvRows = [
    ['Profesor', 'Email', 'Curso', 'Bloque', 'Fecha Inscripción']
  ];

  type ReportTeacher = { name: string | null; email: string | null };
  type ReportCourse = { name: string | null };
  type ReportBlock = { block_name: string | null };
  type ReportRegistration = { teacher: ReportTeacher | ReportTeacher[] | null; registration_date: string | null };
  type ReportRow = {
    course: ReportCourse | ReportCourse[] | null;
    block: ReportBlock | ReportBlock[] | null;
    registration: ReportRegistration | ReportRegistration[] | null;
  };

  const rows = (data ?? []) as ReportRow[];

  for (const item of rows) {
    const registration = Array.isArray(item.registration) ? item.registration[0] : item.registration;
    const teacher = registration?.teacher
      ? Array.isArray(registration.teacher)
        ? registration.teacher[0]
        : registration.teacher
      : null;
    const course = Array.isArray(item.course) ? item.course[0] : item.course;
    const block = Array.isArray(item.block) ? item.block[0] : item.block;

    csvRows.push([
      teacher?.name || '',
      teacher?.email || '',
      course?.name || '',
      block?.block_name || '',
      registration?.registration_date ? new Date(registration.registration_date).toLocaleString() : ''
    ]);
  }

  const csvString = csvRows
    .map(row =>
      row
        .map(cell => {
          const safe = String(cell ?? '').replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(',')
    )
    .join('\n');
  const csvWithBom = '\uFEFF' + csvString;

  return new NextResponse(csvWithBom, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="reporte-${new Date().toISOString()}.csv"`,
    },
  });
}
