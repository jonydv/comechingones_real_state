"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ZONES = [
  { value: "", label: "Todas las zonas" },
  { value: "merlo", label: "Villa de Merlo" },
  { value: "el_trapiche", label: "El Trapiche" },
  { value: "la_florida", label: "La Florida" },
  { value: "potrero_de_los_funes", label: "Potrero de los Funes" },
  { value: "el_volcan", label: "El Volcán" },
  { value: "los_molles", label: "Los Molles" },
  { value: "carpinteria", label: "Carpintería" },
  { value: "villa_de_la_quebrada", label: "Villa de la Quebrada" },
  { value: "papagayos", label: "Papagayos" },
  { value: "quines", label: "Quines" },
  { value: "villa_larca", label: "Villa Larca" },
];

const OPERATIONS = [
  { value: "", label: "Comprar o alquilar" },
  { value: "venta", label: "Comprar" },
  { value: "alquiler", label: "Alquiler" },
  { value: "alquiler_temporario", label: "Temporada" },
];

const TYPES = [
  { value: "", label: "Cualquier tipo" },
  { value: "cabana", label: "Cabaña" },
  { value: "casa", label: "Casa" },
  { value: "terreno", label: "Terreno" },
  { value: "departamento", label: "Departamento" },
  { value: "campo", label: "Campo" },
  { value: "local_comercial", label: "Local comercial" },
  { value: "duplex", label: "Dúplex" },
  { value: "ph", label: "PH" },
];

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
};

function SelectField({ id, label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="relative flex-1 min-w-0">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-lg border border-border bg-card py-3 pl-4 pr-9",
          "text-sm font-body text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          "transition-colors cursor-pointer"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

export default function HeroSearch() {
  const router = useRouter();
  const [zone, setZone] = useState("");
  const [operation, setOperation] = useState("");
  const [type, setType] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (zone) params.set("zone", zone);
    if (operation) params.set("operation_type", operation);
    if (type) params.set("property_type", type);
    router.push(`/propiedades${params.size ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "w-full max-w-3xl",
        "rounded-xl bg-card shadow-2xl shadow-black/20",
        "p-3 sm:p-2",
        "flex flex-col sm:flex-row gap-2"
      )}
      aria-label="Buscador de propiedades"
    >
      <SelectField
        id="hero-zone"
        label="Zona"
        value={zone}
        onChange={setZone}
        options={ZONES}
      />
      <SelectField
        id="hero-operation"
        label="Tipo de operación"
        value={operation}
        onChange={setOperation}
        options={OPERATIONS}
      />
      <SelectField
        id="hero-type"
        label="Tipo de propiedad"
        value={type}
        onChange={setType}
        options={TYPES}
      />

      <button
        type="submit"
        className={cn(
          "flex shrink-0 items-center justify-center gap-2 rounded-lg",
          "bg-accent px-6 py-3",
          "text-sm font-semibold font-body text-primary",
          "transition-all hover:brightness-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        )}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span>Buscar</span>
      </button>
    </form>
  );
}
