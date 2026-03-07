import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { RegistrationSelection } from '@/types';

interface SuccessStepProps {
  onReset: () => void;
  selections: RegistrationSelection[];
}

export function SuccessStep({ onReset, selections }: SuccessStepProps) {
  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl">¡Inscripción Exitosa!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Hemos registrado tu selección de cursos correctamente.
        </p>

        <div className="space-y-3 border rounded-lg p-4 bg-muted/30 text-left">
          <h3 className="font-semibold text-sm text-foreground">Tus Cursos Seleccionados:</h3>
          {selections.map((selection, index) => (
            <div key={index} className="flex flex-col gap-1 border-b last:border-0 pb-2 last:pb-0">
              <span className="text-sm font-medium">{selection.courseName}</span>
              <span className="text-xs text-muted-foreground">Bloque {selection.blockName}</span>
            </div>
          ))}
        </div>

        <p className="text-sm">
          Se ha enviado un correo de confirmación con los detalles de tu inscripción.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onReset} variant="outline">
          Volver al inicio
        </Button>
      </CardFooter>
    </Card>
  );
}
