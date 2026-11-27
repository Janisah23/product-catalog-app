import { useState, type SyntheticEvent } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "cn";

interface Props {
  src: string | undefined;
  alt: string;
  /**
   * "auto" (default) fills the box only when the photo's shape already matches it, so nothing is cropped.
   * Any other shape is shown whole with a margin. "cover" and "contain" force one or the other.
   */
  fit?: "auto" | "cover" | "contain";
  className?: string;
  priority?: boolean;
}

/**
 * Product photo with a loading shimmer and a fallback for broken or missing URLs.
 * Place it inside a relatively positioned box that has an aspect ratio and a background colour:
 * the photo is blended into that background, so white studio backdrops disappear into the tile.
 */
export function ProductImage(props: Props) {
  // Keyed on src so a new photo always starts from the loading state.
  return <Photo key={props.src ?? "none"} {...props} />;
}

function Photo({ src, alt, fit = "auto", className, priority }: Props) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">(src ? "loading" : "failed");
  const [cover, setCover] = useState(fit === "cover");

  function onLoad(e: SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const box = img.parentElement;
    if (fit === "auto" && box && box.clientHeight > 0 && img.naturalHeight > 0) {
      const boxRatio = box.clientWidth / box.clientHeight;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      setCover(Math.abs(imgRatio - boxRatio) / boxRatio < 0.08);
    }
    setState("loaded");
  }

  if (state === "failed") {
    return (
      <div role="img" aria-label={`${alt} (photo unavailable)`} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground">
        <ImageOff className="size-6" aria-hidden="true" />
        <span className="text-[11px]">Photo unavailable</span>
      </div>
    );
  }

  return (
    <>
      {state === "loading" && <div aria-hidden="true" className="absolute inset-0 bg-secondary motion-safe:animate-pulse" />}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={onLoad}
        onError={() => setState("failed")}
        className={cn(
          "absolute inset-0 size-full transition-opacity duration-300",
          state === "loaded" ? "opacity-100" : "opacity-0",
          cover || fit === "cover" ? "object-cover" : "object-contain p-[6%] mix-blend-multiply",
          className,
        )}
      />
    </>
  );
}
