"use client";

import { ConfirmationStep } from "@/components/registration/ConfirmationStep";
import { CourseSelectionStep } from "@/components/registration/CourseSelectionStep";
import { EmailStep } from "@/components/registration/EmailStep";
import { SuccessStep } from "@/components/registration/SuccessStep";
import { RegistrationSelection } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

type Step = "EMAIL" | "SELECTION" | "CONFIRMATION" | "SUCCESS";

export default function RegistrationPage() {
  const [step, setStep] = useState<Step>("EMAIL");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [selections, setSelections] = useState<RegistrationSelection[]>([]);
  const [loading, setLoading] = useState(false);

  const handleEmailNext = (email: string, name: string, existingSelections?: RegistrationSelection[]) => {
    setTeacherEmail(email);
    setTeacherName(name);
    
    if (existingSelections && existingSelections.length > 0) {
      setSelections(existingSelections);
      setStep("SUCCESS");
    } else {
      setStep("SELECTION");
    }
  };

  const handleSelectionNext = (newSelections: RegistrationSelection[]) => {
    setSelections(newSelections);
    setStep("CONFIRMATION");
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: teacherEmail,
          course1_id: selections[0].courseId,
          course1_block: selections[0].blockName,
          course2_id: selections[1].courseId,
          course2_block: selections[1].blockName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar la inscripción.");
      }

      setStep("SUCCESS");
      toast.success("¡Inscripción realizada con éxito!");
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "SELECTION") setStep("EMAIL");
    if (step === "CONFIRMATION") setStep("SELECTION");
  };

  const handleReset = () => {
    setStep("EMAIL");
    setTeacherEmail("");
    setTeacherName("");
    setSelections([]);
  };

  const isEmailStep = step === "EMAIL";
  const isSelectionStep = step === "SELECTION";

  return (
    <div className="min-h-[80vh] w-full">
      <header
        className={
          isEmailStep
            ? "mx-auto w-full max-w-4xl pt-8 pb-6 text-center px-4"
            : "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-4 pb-6"
        }
      >
        {isEmailStep ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo_sgc_90.png" alt="Logo SGC" className="h-40 w-auto" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Sistema de Inscripción Docente
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Selecciona tus cursos y bloques horarios preferidos.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_sgc_90.png" alt="Logo SGC" className="h-40 w-auto" />
            <span className="text-2xl font-semibold tracking-tight text-foreground/90 sm:text-3xl">
              Sistema de Inscripción Docente
            </span>
          </div>
        )}
      </header>

      <div
        className={
          isEmailStep
            ? "mx-auto w-full max-w-lg rounded-xl border bg-card p-8 shadow-sm"
            : isSelectionStep
              ? "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8"
              : "mx-auto w-full max-w-md"
        }
      >
        {step === "EMAIL" && <EmailStep onNext={handleEmailNext} />}

        {step === "SELECTION" && (
          <CourseSelectionStep teacherName={teacherName} onNext={handleSelectionNext} onBack={handleBack} />
        )}

        {step === "CONFIRMATION" && (
          <ConfirmationStep selections={selections} loading={loading} onConfirm={handleConfirm} onBack={handleBack} />
        )}

        {step === "SUCCESS" && <SuccessStep onReset={handleReset} selections={selections} />}
      </div>

    </div>
  );
}
