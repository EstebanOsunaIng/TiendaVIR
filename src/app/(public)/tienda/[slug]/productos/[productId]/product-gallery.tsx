"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomInIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  if (images.length === 0) {
    return <div className="aspect-square rounded-xl bg-muted" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <Dialog>
        <DialogTrigger
          render={
            <button
              type="button"
              aria-label="Ampliar foto"
              className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
            />
          }
        >
          <Image src={activeImage} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
          <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomInIcon className="size-4" />
          </span>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image src={activeImage} alt={alt} fill sizes="90vw" className="object-contain" />
          </div>
        </DialogContent>
      </Dialog>

      {images.length > 1 ? (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver foto ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                index === activeIndex ? "border-primary" : "border-transparent",
              )}
            >
              <Image src={image} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
