import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  withLink?: boolean;
  className?: string;
};

const sizes = {
  sm: { width: 110, height: 28 },
  md: { width: 150, height: 38 },
  lg: { width: 190, height: 48 },
  xl: { width: 240, height: 60 },
};

export function LogoContent({ size = "md", className }: Omit<LogoProps, "withLink">) {
  const s = sizes[size];
  return (
    <span className={cn("flex items-center select-none", className)}>
      <Image
        src="/logo.svg"
        alt="GiziKost"
        width={s.width}
        height={s.height}
        className="object-contain"
        priority
      />
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
