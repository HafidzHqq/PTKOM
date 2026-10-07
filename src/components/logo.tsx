import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  withLink?: boolean;
  className?: string;
};

const sizes = {
  sm: { width: 100, height: 30 },
  md: { width: 140, height: 42 },
  lg: { width: 180, height: 54 },
  xl: { width: 240, height: 72 },
};

export function LogoContent({ size = "md", className }: Omit<LogoProps, "withLink">) {
  const s = sizes[size];
  return (
    <div className={cn("relative flex items-center", className)}>
      <Image
        src="/GiziKost.png"
        alt="GiziKost Logo"
        width={s.width}
        height={s.height}
        className="object-contain"
        priority
      />
    </div>
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
