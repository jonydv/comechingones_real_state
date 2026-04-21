"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const ZONES = [
  { value: "el_trapiche", label: "El Trapiche" },
  { value: "potrero_de_los_funes", label: "Potrero de los Funes" },
  { value: "la_florida", label: "La Florida" },
  { value: "el_volcan", label: "El Volcán" },
  { value: "merlo", label: "Villa de Merlo" },
  { value: "los_molles", label: "Los Molles" },
  { value: "carpinteria", label: "Carpintería" },
  { value: "villa_de_la_quebrada", label: "Villa de la Quebrada" },
  { value: "papagayos", label: "Papagayos" },
  { value: "quines", label: "Quines" },
  { value: "villa_larca", label: "Villa Larca" },
];

const OPERATIONS = [
  { value: "venta", label: "En venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "alquiler_temporario", label: "Temporario" },
];

const PROPERTY_TYPES = [
  { value: "casa", label: "Casa" },
  { value: "cabana", label: "Cabaña" },
  { value: "terreno", label: "Terreno" },
  { value: "departamento", label: "Departamento" },
  { value: "campo", label: "Campo" },
  { value: "local_comercial", label: "Local Comercial" },
  { value: "duplex", label: "Dúplex" },
  { value: "ph", label: "PH" },
];

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset pagination on filter change
      router.push(`/propiedades?${params.toString()}`);
    },
    [router, searchParams]
  );

  const current = (key: string) => searchParams.get(key) ?? "";

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="rounded-xl border border-border bg-card p-5 space-y-6">
        <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Filtros
        </h2>

        {/* Operación */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground font-heading">
            Tipo de operación
          </label>
          <select
            value={current("operation_type")}
            onChange={(e) => setParam("operation_type", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas</option>
            {OPERATIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de propiedad */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground font-heading">
            Tipo de propiedad
          </label>
          <select
            value={current("property_type")}
            onChange={(e) => setParam("property_type", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Zona */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground font-heading">
            Zona
          </label>
          <select
            value={current("zone")}
            onChange={(e) => setParam("zone", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas las zonas</option>
            {ZONES.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>
        </div>

        {/* Precio mínimo */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground font-heading">
            Precio mínimo (USD)
          </label>
          <input
            type="number"
            min={0}
            placeholder="Sin mínimo"
            value={current("price_min")}
            onChange={(e) => setParam("price_min", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Precio máximo */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground font-heading">
            Precio máximo (USD)
          </label>
          <input
            type="number"
            min={0}
            placeholder="Sin máximo"
            value={current("price_max")}
            onChange={(e) => setParam("price_max", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Dormitorios mínimos */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-foreground font-heading">
            Dormitorios mínimos
          </label>
          <select
            value={current("bedrooms_min")}
            onChange={(e) => setParam("bedrooms_min", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Cualquiera</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>

        {/* Limpiar filtros */}
        {searchParams.toString() && (
          <button
            onClick={() => router.push("/propiedades")}
            className="w-full rounded-md border border-border px-3 py-2 text-xs font-body text-muted-foreground hover:bg-muted transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </aside>
  );
}
