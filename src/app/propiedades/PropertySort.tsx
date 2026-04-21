"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "reciente", label: "Más recientes" },
  { value: "precio_asc", label: "Menor precio" },
  { value: "precio_desc", label: "Mayor precio" },
];

type Props = { total: number };

export default function PropertySort({ total }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "reciente";

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground font-body">
        <span className="font-semibold text-foreground">{total}</span>{" "}
        {total === 1 ? "propiedad encontrada" : "propiedades encontradas"}
      </p>

      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground font-body whitespace-nowrap">
          Ordenar por:
        </label>
        <select
          value={currentSort}
          onChange={(e) => handleSort(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
