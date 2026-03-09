"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditCourseDialog } from "./EditCourseDialog";

export type AdminCourseRow = {
  id: string;
  name: string;
  description: string | null;
  room: string | null;
  max_capacity: number;
  is_active: boolean;
};

interface CoursesTableProps {
  initialCourses: AdminCourseRow[];
}

export function CoursesTable({ initialCourses }: CoursesTableProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<AdminCourseRow[]>(initialCourses);
  const [editingCourse, setEditingCourse] = useState<AdminCourseRow | null>(null);

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const handleDelete = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error deleting course");
      }

      toast.success("Curso eliminado correctamente");
      setCourses(courses.filter((c) => c.id !== courseId));
      router.refresh();
    } catch {
      toast.error("Error al eliminar el curso");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader className="flex-grow pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg leading-tight line-clamp-2" title={course.name}>
                  {course.name}
                </CardTitle>
                <Badge
                  variant={course.is_active ? "default" : "destructive"}
                  className="shrink-0"
                >
                  {course.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2" title={course.description || ""}>
                {course.description || "Sin descripción"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-2">
                <span>Cupos máximos:</span>
                <span className="font-medium text-foreground">{course.max_capacity}</span>
              </div>
              {course.room && (
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span>Sala:</span>
                  <span className="font-medium text-foreground">{course.room}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 justify-end gap-2 mt-auto">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCourse(course)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará el curso y toda la información
                        relacionada.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(course.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {editingCourse && (
        <EditCourseDialog
          course={editingCourse}
          open={!!editingCourse}
          onOpenChange={(open) => !open && setEditingCourse(null)}
          onSuccess={() => {
            setEditingCourse(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
