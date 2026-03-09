import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Course, CourseBlock, RegistrationSelection } from '@/types';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface CourseSelectionStepProps {
  teacherName: string;
  onNext: (selections: RegistrationSelection[]) => void;
  onBack: () => void;
}

export function CourseSelectionStep({ teacherName, onNext, onBack }: CourseSelectionStepProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<RegistrationSelection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      const supabase = createClient();
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (coursesError) {
        toast.error('Error al cargar los cursos.');
        setLoading(false);
        return;
      }

      const { data: blocksData, error: blocksError } = await supabase
        .from('course_blocks')
        .select('*');

      if (blocksError) {
        toast.error('Error al cargar los bloques.');
        setLoading(false);
        return;
      }

      const coursesWithBlocks = coursesData.map((course) => ({
        ...course,
        blocks: blocksData.filter((block) => block.course_id === course.id).sort((a, b) => a.block_name.localeCompare(b.block_name)),
      }));

      setCourses(coursesWithBlocks);
      setLoading(false);
    };

    fetchCourses();

    // Realtime subscription
    const supabase = createClient();
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'course_blocks',
        },
        (payload) => {
          setCourses((currentCourses) =>
            currentCourses.map((course) => ({
              ...course,
              blocks: course.blocks.map((block) =>
                block.id === payload.new.id ? { ...block, ...payload.new } : block
              ),
            }))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSelect = (course: Course, block: CourseBlock) => {
    if (block.available_slots <= 0) {
      toast.error('Este bloque no tiene cupos disponibles.');
      return;
    }

    const isSelected = selections.some((s) => s.courseId === course.id && s.blockName === block.block_name);

    if (isSelected) {
      // Deselect
      setSelections(selections.filter((s) => s.courseId !== course.id));
    } else {
      // Check limits
      if (selections.length >= 2) {
        // If already 2 selected, check if this is a block switch or a new course
        const isSwitchingBlock = selections.some((s) => s.courseId === course.id);
        if (!isSwitchingBlock) {
          toast.error('Solo puedes seleccionar 2 cursos.');
          return;
        }
      }

      // Check block conflicts
      // We need to ensure we don't select the same block twice across DIFFERENT courses.
      // 1. Find if there is another selection (different course) that has the same block name.
      const conflictingSelection = selections.find(s => s.courseId !== course.id && s.blockName === block.block_name);
      
      if (conflictingSelection) {
        toast.error(`Ya seleccionaste un curso en el Bloque ${block.block_name}. Debes seleccionar un curso en el Bloque ${block.block_name === 'A' ? 'B' : 'A'}.`);
        return;
      }

      // Check if course already selected with different block
      if (selections.some((s) => s.courseId === course.id)) {
        // Switch block for same course
        setSelections(selections.map(s => s.courseId === course.id ? { courseId: course.id, blockName: block.block_name, courseName: course.name } : s));
      } else {
        // Add new selection
        setSelections([...selections, { courseId: course.id, blockName: block.block_name, courseName: course.name }]);
      }
    }
  };

  const isSelected = (courseId: string, blockName: string) => {
    return selections.some((s) => s.courseId === courseId && s.blockName === blockName);
  };

  const isCourseSelected = (courseId: string) => {
    return selections.some((s) => s.courseId === courseId);
  };

  const handleSubmit = () => {
    if (selections.length !== 2) {
      toast.error('Debes seleccionar exactamente 2 cursos.');
      return;
    }
    onNext(selections);
  };

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const lowerQuery = searchQuery.toLowerCase();
    return courses.filter(course =>
      course.name.toLowerCase().includes(lowerQuery) ||
      course.description?.toLowerCase().includes(lowerQuery)
    );
  }, [courses, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Hola, {teacherName}</h2>
            <p className="text-muted-foreground">Selecciona 2 prácticas y sus respectivos bloques horarios.</p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant={selections.length === 2 ? "default" : "secondary"} className="text-base px-4 py-1">
                {selections.length}/2 Seleccionados
            </Badge>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar cursos por nombre..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No se encontraron cursos que coincidan con “{searchQuery}”
          </div>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} className={cn("transition-all h-full flex flex-col", isCourseSelected(course.id) ? "border-primary ring-1 ring-primary" : "")}>
            <CardHeader className="pb-3 flex-grow block">
              <CardTitle className="text-lg line-clamp-3 leading-tight w-full block">{course.name}</CardTitle>
              <CardDescription className="text-xs w-full block mt-2 text-left">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <div className="grid grid-cols-2 gap-2">
                {course.blocks.map((block) => {
                  const selected = isSelected(course.id, block.block_name);
                  const disabled = block.available_slots <= 0;

                  return (
                    <Button
                      key={block.id}
                      variant={selected ? "default" : "outline"}
                      className={cn(
                        "w-full flex flex-col items-center h-auto py-2 gap-0.5",
                        selected ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                      )}
                      onClick={() => !disabled && handleSelect(course, block)}
                      disabled={disabled}
                    >
                      <span className="font-bold text-sm whitespace-nowrap">Bloque {block.block_name}</span>
                      <span className={cn(
                        "text-[10px] whitespace-nowrap", 
                        selected ? "text-primary-foreground/90" : (block.available_slots < 5 ? "text-red-500 font-bold" : "text-muted-foreground")
                      )}>
                        {block.available_slots} cupos
                      </span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-background/95 backdrop-blur border-t flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Atrás
        </Button>
        <Button onClick={handleSubmit} disabled={selections.length !== 2} className="flex-1">
          Confirmar Selección
        </Button>
      </div>
    </div>
  );
}
