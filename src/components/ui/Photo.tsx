import Image from "next/image";
import { cn } from "@/lib/utils";

interface PhotoProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /** Focal point, e.g. "50% 30%", for crops that need protecting. */
  position?: string;
}

/**
 * Every photograph on the site sits in the same rounded, softly shadowed
 * container so the imagery reads as one set rather than as pasted-in stock.
 */
export function Photo({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  className,
  imageClassName,
  position,
}: PhotoProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-[28px] bg-mist", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        style={position ? { objectPosition: position } : undefined}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
