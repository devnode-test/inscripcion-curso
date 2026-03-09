import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationSelection } from '@/types';
import { Loader2 } from 'lucide-react';

interface ConfirmationStepProps {
  selections: RegistrationSelection[];
  loading: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmationStep({ selections, loading, onConfirm, onBack }: ConfirmationStepProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Confirmar Selección</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Por favor revisa tu selección antes de confirmar.
        </p>
        <div className="space-y-2 border rounded-lg p-4">
          {selections.map((selection) => (
            <div key={selection.courseId} className="flex flex-col gap-2 py-3 border-b last:border-0">
              <span className="font-semibold text-base">{selection.courseName}</span>
              {selection.room && (
                <span className="text-sm text-muted-foreground">Sala: {selection.room}</span>
              )}
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm font-medium border">
                  Bloque {selection.blockName}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Al confirmar, se reservarán tus cupos y recibirás un correo de confirmación.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Atrás
        </Button>
        <Button onClick={onConfirm} disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            'Confirmar Inscripción'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
