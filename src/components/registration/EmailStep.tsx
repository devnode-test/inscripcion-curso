import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { RegistrationSelection } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

interface EmailStepProps {
  onNext: (email: string, name: string, existingSelections?: RegistrationSelection[]) => void;
}

export function EmailStep({ onNext }: EmailStepProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  type RegistrationCourse = { name: string | null };
  type RegistrationBlock = { block_name: string | null };
  type SelectedCourse = {
    course: RegistrationCourse | RegistrationCourse[] | null;
    block: RegistrationBlock | RegistrationBlock[] | null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // Check if email exists in whitelist
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('id, name')
        .eq('email', email)
        .single();

      if (error || !teacher) {
        toast.error('El correo electrónico no está registrado en la lista de profesores autorizados.');
        setLoading(false);
        return;
      }

      // Check if already registered
      const { data: registration } = await supabase
        .from('registrations')
        .select(`
          id,
          selected_courses (
            course:courses(name),
            block:course_blocks(block_name)
          )
        `)
        .eq('teacher_id', teacher.id)
        .eq('status', 'completed')
        .maybeSingle();

      if (registration) {
        toast.info('Ya has realizado tu inscripción. Aquí están tus selecciones.');
        const selectedCourses = (registration.selected_courses ?? []) as SelectedCourse[];
        const formattedSelections = selectedCourses.map((sc) => {
          const course = Array.isArray(sc.course) ? sc.course[0] : sc.course;
          const block = Array.isArray(sc.block) ? sc.block[0] : sc.block;
          return {
            courseId: 'completed',
            courseName: course?.name ?? '',
            blockName: block?.block_name ?? ''
          };
        });
        onNext(email, teacher.name, formattedSelections);
        setLoading(false);
        return;
      }

      onNext(email, teacher.name);
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al validar el correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Inscripción de Cursos</h2>
        <p className="text-sm text-gray-500">Ingresa tu correo institucional para comenzar.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="docente@saintgeorge.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-11 text-base font-medium text-white shadow-sm"
          disabled={loading}
        >
          {loading ? 'Validando...' : 'Continuar'}
        </Button>
      </form>
    </div>
  );
}
