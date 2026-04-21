"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

type Props = {
  tenantId: string;
  propertyId: string;
  tenantName: string;
};

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactForm({ tenantId, propertyId, tenantName }: Props) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      tenantId,
      propertyId,
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
      source: "web_form",
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setState("success");
        form.reset();
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.error ?? "Ocurrió un error. Intentá de nuevo.");
        setState("error");
      }
    } catch {
      setErrorMsg("Sin conexión. Verificá tu internet e intentá de nuevo.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
          <MessageCircle className="h-6 w-6 text-secondary" />
        </div>
        <p className="font-heading font-semibold text-foreground">
          ¡Consulta enviada!
        </p>
        <p className="text-sm text-muted-foreground font-body">
          {tenantName} se pondrá en contacto a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-5 space-y-4"
    >
      <h3 className="font-heading font-semibold text-base text-foreground">
        Consultar propiedad
      </h3>

      <div className="space-y-1">
        <label htmlFor="contact-name" className="block text-xs font-semibold font-heading text-foreground">
          Nombre *
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          placeholder="Tu nombre"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-email" className="block text-xs font-semibold font-heading text-foreground">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-phone" className="block text-xs font-semibold font-heading text-foreground">
          Teléfono
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          placeholder="2664 123456"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-message" className="block text-xs font-semibold font-heading text-foreground">
          Mensaje
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={3}
          placeholder="Me interesa esta propiedad..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <p className="text-xs text-muted-foreground font-body">
        Requerido: nombre + email o teléfono.
      </p>

      {state === "error" && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive font-body">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground font-body transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {state === "loading" ? "Enviando..." : "Enviar consulta"}
      </button>
    </form>
  );
}
