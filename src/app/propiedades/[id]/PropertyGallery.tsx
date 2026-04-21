"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaItem = { url: string; altText: string | null };

type Props = {
  media: MediaItem[];
  title: string;
};

export default function PropertyGallery({ media, title }: Props) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (media.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-muted">
        <Maximize2 className="h-12 w-12 text-muted-foreground/30" />
      </div>
    );
  }

  const prev = () => setActive((i) => (i === 0 ? media.length - 1 : i - 1));
  const next = () => setActive((i) => (i === media.length - 1 ? 0 : i + 1));

  return (
    <>
      {/* ── Galería principal ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Imagen activa */}
        <div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={media[active].url}
            alt={media[active].altText ?? `${title} — foto ${active + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority
          />

          {/* Controles de navegación */}
          {media.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Contador */}
          <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
            {active + 1} / {media.length}
          </span>
        </div>

        {/* Thumbnails */}
        {media.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {media.map((item, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                  i === active
                    ? "border-primary"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
                aria-label={`Ver foto ${i + 1}`}
              >
                <Image
                  src={item.url}
                  alt={item.altText ?? `Miniatura ${i + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar galería"
          >
            <X className="h-5 w-5" />
          </button>

          {media.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="relative mx-16 max-h-[85vh] max-w-5xl w-full aspect-[16/9]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={media[active].url}
              alt={media[active].altText ?? `${title} — foto ${active + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
