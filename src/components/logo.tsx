import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  withLink?: boolean;
  className?: string;
};

const heights = {
  sm: "h-7 sm:h-8",
  md: "h-8 sm:h-10",
  lg: "h-11 sm:h-14 w-auto max-w-full",
  xl: "h-14 sm:h-18 w-auto max-w-full",
};

export function LogoContent({ size = "md", className }: Omit<LogoProps, "withLink">) {
  return (
    <span className={cn("inline-flex items-center select-none", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.jpeg"
        alt="DompetKost"
        className={cn(heights[size], "w-auto object-contain", className)}
      />
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
