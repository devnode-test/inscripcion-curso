import { SearchCourses } from '@/components/admin/dashboard/SearchCourses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { Download } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminDashboard({
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

  // Fetch courses with block stats
  let coursesQuery = supabase
    .from('courses')
    .select(`
      id,
      name,
      room,
      max_capacity,
      blocks:course_blocks(
        id,
        block_name,
        available_slots,
        total_capacity
      )
    `)
    .order('name');

  if (query) {
    coursesQuery = coursesQuery.ilike('name', `%${query}%`);
  }

  const { data: courses, error } = await coursesQuery;

  if (error) {
    return <div>Error cargando datos</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button asChild>
            <Link href="/admin/courses">
              Gestión de Cursos
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/teachers">
              Gestión de Profesores
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/api/download-report" target="_blank">
              <Download className="mr-2 h-4 w-4" />
              Descargar Reporte General
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <SearchCourses />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col h-full">
            <CardHeader className="pb-3 bg-muted/20">
              <CardTitle className="text-lg font-bold leading-tight" title={course.name}>
                {course.name}
              </CardTitle>
              {course.room && (
                <div className="text-sm text-muted-foreground pt-1">
                  Sala: {course.room}
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-grow pt-4">
              <div className="space-y-4">
                {course.blocks
                  .sort((a, b) => a.block_name.localeCompare(b.block_name))
                  .map((block) => {
                    const enrolled = block.total_capacity - block.available_slots;
                    const percentage = Math.round((enrolled / block.total_capacity) * 100);
                    const isFull = block.available_slots === 0;

                    return (
                      <div key={block.id} className="space-y-2 border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm">Bloque {block.block_name}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {isFull ? 'Completo' : 'Disponible'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="block font-medium text-foreground">{enrolled}</span>
                            Inscritos
                          </div>
                          <div>
                            <span className="block font-medium text-foreground">{block.available_slots}</span>
                            Disponibles
                          </div>
                        </div>

                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isFull ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <div className="pt-1 text-right">
                           <Button asChild size="sm" variant="ghost" className="h-7 text-xs px-2 w-full sm:w-auto">
                            <Link href={`/api/download-report?course_id=${course.id}&block=${block.block_name}`} target="_blank">
                              <Download className="mr-1.5 h-3 w-3" />
                              Descargar Lista
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
