"use client";

import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

type ServiceGalleryProps = {
  images: string[];
  name: string;
};

/** Interactive photo gallery for the service details page. */
export function ServiceGallery({ images, name }: ServiceGalleryProps) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const activeImage = images[active] ?? images[0];
  const total = images.length;

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/10">
        <motion.div
          key={active}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Image
            src={activeImage}
            alt={`${name} — photo ${active + 1} of ${total}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </motion.div>
        <span className="absolute right-3 bottom-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
          {active + 1} / {total}
        </span>
      </div>

      {total > 1 ? (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label={`Photos of ${name}`}
        >
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1} of ${total}`}
              aria-pressed={active === index}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-20",
                active === index
                  ? "ring-2 ring-primary"
                  : "ring-foreground/10 hover:ring-foreground/30",
              )}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
