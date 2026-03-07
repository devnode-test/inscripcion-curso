import { AddTeacherDialog } from '@/components/admin/teachers/AddTeacherDialog';
import { TeachersTable } from '@/components/admin/teachers/TeachersTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SearchCourses } from '@/components/admin/dashboard/SearchCourses';

export default async function AdminTeachersPage({
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

  let teachersQuery = supabase
    .from('teachers')
    .select('*')
    .order('created_at', { ascending: false });

  if (query) {
    teachersQuery = teachersQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  const { data: teachers, error } = await teachersQuery;

  if (error) {
    return <div>Error cargando profesores</div>;
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Profesores</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
          <div className="w-full sm:max-w-xs">
            <SearchCourses placeholder="Buscar profesores..." />
          </div>
          <div className="w-full sm:w-auto">
             <AddTeacherDialog />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Listado de Profesores ({teachers?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <TeachersTable initialTeachers={teachers || []} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
