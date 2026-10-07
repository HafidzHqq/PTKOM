import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  withLink?: boolean;
  className?: string;
};

const sizes = {
  sm: { icon: "h-7 w-7", text: "text-lg" },
  md: { icon: "h-8 w-8", text: "text-xl" },
  lg: { icon: "h-12 w-12", text: "text-3xl" },
  xl: { icon: "h-16 w-16", text: "text-4xl" },
};

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      {/* trunk */}
      <rect x="21.5" y="28" width="5" height="12" rx="2" fill="#7c4a21" />
      <rect x="14" y="36" width="20" height="4" rx="2" fill="#5b3416" opacity="0.25" />
      {/* foliage - fluffy tree */}
      <circle cx="24" cy="18" r="14" fill="#22c55e" />
      <circle cx="14" cy="22" r="8" fill="#16a34a" />
      <circle cx="34" cy="22" r="8" fill="#16a34a" />
      <circle cx="18" cy="13" r="5" fill="#4ade80" />
      <circle cx="29" cy="12" r="4.5" fill="#4ade80" />
      {/* highlight */}
      <circle cx="21" cy="16" r="2.5" fill="#bbf7d0" opacity="0.9" />
    </svg>
  );
}

export function LogoContent({ size = "md", className }: Omit<LogoProps, "withLink">) {
  const s = sizes[size];
  return (
    <span className={cn("flex items-center gap-1.5 select-none", className)}>
      <LogoMark className={cn("shrink-0 drop-shadow-sm", s.icon)} />
      <span className={cn("font-extrabold tracking-tight leading-none", s.text)}>
        <span className="text-neutral-900">Gizi</span>
        <span className="text-green-600">Kost</span>
      </span>
    </span>
  );
}

export default function Logo({ size = "md", withLink = true, className }: LogoProps) {
  if (!withLink) return <LogoContent size={size} className={className} />;
  return (
    <Link href="/" className={cn("flex items-center", className)} aria-label="GiziKost - Beranda">
      <LogoContent size={size} />
    </Link>
  );
}
