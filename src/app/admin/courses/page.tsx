import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CoursesTable } from '@/components/admin/courses/CoursesTable';
import { AddCourseDialog } from '@/components/admin/courses/AddCourseDialog';
import { SearchCourses } from '@/components/admin/dashboard/SearchCourses';

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const params = await searchParams;
  const query = params?.query || '';

  if (!token) {
    redirect('/admin/login');
  }

  const supabase = await createClient();

  let coursesQuery = supabase
    .from('courses')
    .select(`
      *,
      blocks:course_blocks(*)
    `)
    .order('name');

  if (query) {
    coursesQuery = coursesQuery.ilike('name', `%${query}%`);
  }

  const { data: courses, error } = await coursesQuery;

  if (error) {
    return <div>Error cargando cursos</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
          <div className="w-full sm:max-w-xs">
            <SearchCourses placeholder="Buscar cursos..." />
          </div>
          <div className="w-full sm:w-auto">
             <AddCourseDialog />
          </div>
        </div>
      </div>

      <CoursesTable initialCourses={courses} />
    </div>
  );
}
