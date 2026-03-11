"use client";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function RegistrationToggle() {
  const [open, setOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const resp = await fetch("/api/admin/settings/registrations");
        if (resp.ok) {
          const json = await resp.json();
          setOpen(Boolean(json.registrations_open));
        }
      } catch {
        // ignore
      }
    };
    fetchStatus();
  }, []);

  const onChange = async (checked: boolean) => {
    setLoading(true);
    try {
      const resp = await fetch("/api/admin/settings/registrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrations_open: checked }),
      });
      if (!resp.ok) throw new Error("Error actualizando estado");
      setOpen(checked);
      toast.success(checked ? "Inscripciones abiertas" : "Inscripciones cerradas");
    } catch {
      toast.error("No se pudo actualizar el estado de inscripciones");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Switch id="registrations-toggle" checked={open} disabled={loading} onCheckedChange={onChange} />
      <Label htmlFor="registrations-toggle">
        {open ? "Inscripciones abiertas" : "Inscripciones cerradas"}
      </Label>
    </div>
  );
}
