"use client";

import React from "react";
import { useState, type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: ReactNode;
  caseStudy?: {
    title: string;
    description: string;
    result: string;
  };
}

interface ServiceTabsProps {
  services: Service[];
  className?: string;
}

export function ServiceTabs({ services, className }: ServiceTabsProps) {
  const [activeTab, setActiveTab] = useState(services[0]?.id || "");

  return (
    <Tabs
      defaultValue={services[0]?.id}
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn("w-full", className)}
    >
      <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
        {services.map((service) => (
          <TabsTrigger
            key={service.id}
            value={service.id}
            className="text-sm md:text-base py-3"
          >
            {service.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {services.map((service) => (
        <TabsContent
          key={service.id}
          value={service.id}
          className="space-y-6 animate-fadeIn"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold font-heading">
                {service.title}
              </h3>
              <p className="text-muted-foreground">{service.description}</p>

              <ul className="space-y-2 mt-4">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link href="/contact">
                  <Button>
                    Request a Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {service.caseStudy && (
              <div className="glass p-6 rounded-lg space-y-4">
                <h4 className="text-xl font-bold">Case Study</h4>
                <h5 className="text-lg font-medium">
                  {service.caseStudy.title}
                </h5>
                <p className="text-muted-foreground">
                  {service.caseStudy.description}
                </p>
                <div className="bg-primary/5 p-4 rounded-md">
                  <h6 className="font-semibold">Results:</h6>
                  <p>{service.caseStudy.result}</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
