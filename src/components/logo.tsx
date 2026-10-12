import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  withLink?: boolean;
  className?: string;
};

const sizes = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 48, height: 48 },
  xl: { width: 56, height: 56 },
};

export function LogoContent({ size = "md", className }: Omit<LogoProps, "withLink">) {
  const s = sizes[size];
  return (
    <span className={cn("flex items-center gap-2.5 select-none", className)}>
      <Image
        src="/logo.png"
        alt="DompetKost"
        width={s.width}
        height={s.height}
        className="object-contain rounded-lg"
        priority
      />
      <span className="text-lg font-black tracking-tight text-black leading-none">
        Dompet<span className="text-neutral-500">Kost</span>
      </span>
    </span>
  );
}

export default function Logo({ size = "md", withLink = true, className }: LogoProps) {
  if (!withLink) return <LogoContent size={size} className={className} />;
  return (
    <Link href="/" className={cn("flex items-center", className)} aria-label="DompetKost - Beranda">
      <LogoContent size={size} />
    </Link>
  );
}
