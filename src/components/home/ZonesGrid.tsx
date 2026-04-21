import Image from "next/image";
import Link from "next/link";

type Zone = {
  slug: string;
  label: string;
  subtitle: string;
  photo: string;
  photoAlt: string;
};

// Zonas principales del Corredor con fotos representativas de Unsplash
const FEATURED_ZONES: Zone[] = [
  {
    slug: "merlo",
    label: "Villa de Merlo",
    subtitle: "El microclima más sano del mundo",
    photo:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    photoAlt: "Vista panorámica de las sierras de Merlo",
  },
  {
    slug: "el_trapiche",
    label: "El Trapiche",
    subtitle: "Cañones y cascadas serranas",
    photo:
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80",
    photoAlt: "Paisaje de cañón con río en El Trapiche",
  },
  {
    slug: "la_florida",
    label: "La Florida",
    subtitle: "Naturaleza y río cristalino",
    photo:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    photoAlt: "Bosque serrano en La Florida",
  },
  {
    slug: "potrero_de_los_funes",
    label: "Potrero de los Funes",
    subtitle: "El lago más bello de San Luis",
    photo:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    photoAlt: "Lago sereno en Potrero de los Funes",
  },
  {
    slug: "los_molles",
    label: "Los Molles",
    subtitle: "Aguas termales entre montañas",
    photo:
      "https://images.unsplash.com/photo-1580736031209-97e6b0ad7f95?w=800&q=80",
    photoAlt: "Termas naturales rodeadas de vegetación",
  },
  {
    slug: "carpinteria",
    label: "Carpintería",
    subtitle: "Valle tranquilo y aire puro",
    photo:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80",
    photoAlt: "Valle verde serrano en Carpintería",
  },
  {
    slug: "el_volcan",
    label: "El Volcán",
    subtitle: "Paisaje dramático y silvestre",
    photo:
      "https://images.unsplash.com/photo-1682686581030-7fa4ea2b96c3?w=800&q=80",
    photoAlt: "Formaciones rocosas volcánicas",
  },
  {
    slug: "villa_larca",
    label: "Villa Larca",
    subtitle: "Pueblo pintoresco de las sierras",
    photo:
      "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&q=80",
    photoAlt: "Pueblo serrano con casas de piedra",
  },
];

export default function ZonesGrid() {
  return (
    <section aria-labelledby="zones-title" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-widest text-secondary mb-2">
              Explorá la región
            </p>
            <h2
              id="zones-title"
              className="font-heading text-3xl font-bold text-foreground lg:text-4xl"
            >
              Buscar por zona
            </h2>
          </div>
          <Link
            href="/propiedades"
            className="shrink-0 font-body text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-secondary"
          >
            Ver todas las zonas →
          </Link>
        </div>

        {/* Grid — 4 cols desktop, 2 tablet, 2 mobile */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {FEATURED_ZONES.map((zone, i) => (
            <ZoneCard key={zone.slug} zone={zone} priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ZoneCard({ zone, priority }: { zone: Zone; priority: boolean }) {
  return (
    <Link
      href={`/propiedades?zone=${zone.slug}`}
      className="group relative overflow-hidden rounded-xl aspect-[3/4] sm:aspect-square lg:aspect-[3/4] block"
      aria-label={`Propiedades en ${zone.label}`}
    >
      {/* Imagen de fondo */}
      <Image
        src={zone.photo}
        alt={zone.photoAlt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        priority={priority}
      />

      {/* Gradient overlay — más denso en la parte inferior */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        aria-hidden="true"
      />

      {/* Texto */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-heading text-base font-semibold text-white leading-tight">
          {zone.label}
        </h3>
        <p className="mt-0.5 font-body text-xs text-white/70 line-clamp-1 hidden sm:block">
          {zone.subtitle}
        </p>
      </div>

      {/* Borde accent en hover */}
      <div
        className="absolute inset-0 rounded-xl ring-2 ring-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}
