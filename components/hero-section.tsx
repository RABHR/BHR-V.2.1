import React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  imageUrl?: string;
  fullWidth?: boolean;
}

export function HeroSection({
  title,
  subtitle,
  children,
  className,
  imageUrl,
  fullWidth = false,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative min-h-[90vh] flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "container relative z-10 px-4 py-24 md:py-32",
          fullWidth && "max-w-none"
        )}
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading animate-fadeIn leading-tight text-intermediate">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xl md:text-2xl text-muted-foreground animate-fadeIn animation-delay-200 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}

          {children && (
            <div className="mt-10 animate-fadeIn animation-delay-300">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
