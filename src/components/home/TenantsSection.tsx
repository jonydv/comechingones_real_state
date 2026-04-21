import Image from "next/image";
import Link from "next/link";

type TenantPreview = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
};

type Props = {
  tenants: TenantPreview[];
};

export default function TenantsSection({ tenants }: Props) {
  if (tenants.length === 0) return null;

  return (
    <section
      aria-labelledby="tenants-title"
      className="border-t border-border bg-muted py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="font-body text-sm font-semibold uppercase tracking-widest text-secondary mb-2">
            Trabajamos con las mejores
          </p>
          <h2
            id="tenants-title"
            className="font-heading text-3xl font-bold text-foreground"
          >
            Agencias del corredor
          </h2>
        </div>

        {/* Scrollable row en mobile, centered grid en desktop */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {tenants.map((tenant) => (
            <TenantChip key={tenant.id} tenant={tenant} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TenantChip({ tenant }: { tenant: TenantPreview }) {
  const initial = tenant.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/propiedades?tenant_slug=${tenant.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
      aria-label={`Ver propiedades de ${tenant.name}`}
    >
      {/* Logo o inicial */}
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{ backgroundColor: tenant.primaryColor ?? "#14354D" }}
      >
        {tenant.logoUrl ? (
          <Image
            src={tenant.logoUrl}
            alt={`Logo de ${tenant.name}`}
            fill
            sizes="40px"
            className="object-contain p-1"
          />
        ) : (
          <span className="font-heading text-lg font-bold text-white">
            {initial}
          </span>
        )}
      </div>

      <span className="font-body text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {tenant.name}
      </span>
    </Link>
  );
}
