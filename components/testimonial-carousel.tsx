"use client";
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  company: string;
  role: string;
  quote: string;
  image?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  className?: string;
}

export function TestimonialCarousel({
  testimonials,
  className,
}: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const next = () => {
    setCurrent((current + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [current, autoplay, testimonials.length]);

  return (
    <div
      className={cn(
        "relative overflow-hidden glass rounded-lg p-6 md:p-8",
        className
      )}
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      <div className="absolute top-4 left-4 text-primary opacity-30">
        <Quote size={48} />
      </div>

      <div className="relative z-10">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={cn(
              "transition-opacity duration-500 space-y-4",
              current === index ? "opacity-100" : "opacity-0 absolute inset-0"
            )}
          >
            <blockquote className="text-lg md:text-xl italic text-foreground mb-6 relative z-10 pt-8">
              "{testimonial.quote}"
            </blockquote>

            <div className="flex items-center space-x-4">
              {testimonial.image ? (
                <Image
                  src={
                    testimonial.image || "/placeholder.svg?height=60&width=60"
                  }
                  alt={testimonial.name}
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-[60px] h-[60px] rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
              )}

              <div>
                <h4 className="font-bold">{testimonial.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={prev}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={next}
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 flex space-x-1">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              current === index ? "bg-primary" : "bg-gray-300"
            )}
            onClick={() => setCurrent(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
