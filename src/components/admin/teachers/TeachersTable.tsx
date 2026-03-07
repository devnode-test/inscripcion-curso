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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Mail, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditTeacherDialog } from "./EditTeacherDialog";

export type AdminTeacherRow = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
};

interface TeachersTableProps {
  initialTeachers: AdminTeacherRow[];
}

export function TeachersTable({ initialTeachers }: TeachersTableProps) {
  const router = useRouter();
  const [teachers, setTeachers] = useState<AdminTeacherRow[]>(initialTeachers);
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacherRow | null>(null);

  useEffect(() => {
    setTeachers(initialTeachers);
  }, [initialTeachers]);

  const handleDelete = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error deleting teacher");
      }

      toast.success("Profesor eliminado correctamente");
      setTeachers(teachers.filter((t) => t.id !== teacherId));
      router.refresh();
    } catch (error) {
      toast.error("Error al eliminar el profesor");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="flex flex-col">
            <CardHeader className="flex-grow pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg leading-tight line-clamp-2" title={teacher.name}>
                  {teacher.name}
                </CardTitle>
                <Badge
                  variant={teacher.is_active ? "default" : "destructive"}
                  className="shrink-0"
                >
                  {teacher.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2" title={teacher.email}>
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{teacher.email}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 justify-end gap-2 mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingTeacher(teacher)}
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
                      Esta acción no se puede deshacer. Se eliminará el profesor y todas sus
                      inscripciones.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(teacher.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {editingTeacher && (
        <EditTeacherDialog
          teacher={editingTeacher}
          open={!!editingTeacher}
          onOpenChange={(open) => !open && setEditingTeacher(null)}
          onSuccess={() => {
            setEditingTeacher(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
