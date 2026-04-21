/**
 * Helpers de formato para la UI del marketplace.
 * Usados en server components → sin dependencias de cliente.
 */

// ─── Zona → Etiqueta legible ──────────────────────────────────────────────────

const ZONE_LABELS: Record<string, string> = {
  el_trapiche: "El Trapiche",
  potrero_de_los_funes: "Potrero de los Funes",
  la_florida: "La Florida",
  el_volcan: "El Volcán",
  merlo: "Villa de Merlo",
  los_molles: "Los Molles",
  carpinteria: "Carpintería",
  villa_de_la_quebrada: "Villa de la Quebrada",
  papagayos: "Papagayos",
  quines: "Quines",
  villa_larca: "Villa Larca",
  otra: "Otra zona",
};

export function zoneLabel(zone: string): string {
  return ZONE_LABELS[zone] ?? zone;
}

// ─── Operación → Etiqueta + color ────────────────────────────────────────────

export type OperationStyle = {
  label: string;
  className: string; // Tailwind classes para el badge
};

const OPERATION_STYLES: Record<string, OperationStyle> = {
  venta: {
    label: "En venta",
    className: "bg-primary/10 text-primary",
  },
  alquiler: {
    label: "Alquiler",
    className: "bg-secondary/10 text-secondary",
  },
  alquiler_temporario: {
    label: "Temporario",
    className: "bg-accent/10 text-accent-fg",
  },
};

export function operationStyle(op: string): OperationStyle {
  return (
    OPERATION_STYLES[op] ?? {
      label: op,
      className: "bg-muted text-muted-fg",
    }
  );
}

// ─── Precio ───────────────────────────────────────────────────────────────────

/**
 * Formatea precio con la convención local:
 *  - ARS: $\u00A01.250.000 (punto de miles)
 *  - USD: USD\u00A085.000
 */
export function formatPrice(
  price: number | null | undefined,
  currency: "ARS" | "USD",
  pricePerNight?: number | null
): string {
  const amount = price ?? pricePerNight;
  if (amount == null) return "Consultar precio";

  if (currency === "ARS") {
    const formatted = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return pricePerNight ? `${formatted} / noche` : formatted;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencyDisplay: "symbol",
  }).format(amount);
  return pricePerNight ? `${formatted} / noche` : formatted;
}
