import Link from "next/link";
import { MapPin, Menu } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading font-semibold text-primary"
          aria-label="Horizonte Comechingones — inicio"
        >
          <MapPin className="h-5 w-5 text-accent" aria-hidden="true" />
          <span className="hidden sm:block text-lg tracking-tight">
            Horizonte{" "}
            <span className="font-bold">Comechingones</span>
          </span>
          <span className="sm:hidden text-lg font-bold">HC</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-body font-medium">
          <Link
            href="/propiedades"
            className="text-foreground/70 transition-colors hover:text-primary"
          >
            Propiedades
          </Link>
          <Link
            href="/propiedades?zone=merlo"
            className="text-foreground/70 transition-colors hover:text-primary"
          >
            Merlo
          </Link>
          <Link
            href="/propiedades?zone=el_trapiche"
            className="text-foreground/70 transition-colors hover:text-primary"
          >
            El Trapiche
          </Link>
          <Link
            href="/propiedades?zone=la_florida"
            className="text-foreground/70 transition-colors hover:text-primary"
          >
            La Florida
          </Link>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white font-body"
          >
            Acceder
          </Link>
          {/* Mobile menu trigger — solo visual en esta fase */}
          <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground/60"
            aria-label="Abrir menú"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
