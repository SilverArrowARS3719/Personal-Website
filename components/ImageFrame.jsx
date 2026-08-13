"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function ImageFrame({
  src,
  alt,
  caption,
  priority = false,
  className = "aspect-[4/3]",
  // captions default to the on-page colour; pass the ink variant when the frame
  // sits inside a light card, or the text lands at about 2:1 against white
  captionClassName = "text-paper-soft",
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);
  const imgRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  useEffect(() => {
    // a cached image can finish loading before React attaches onLoad, so the
    // load event fires and is missed, leaving `loaded` stuck false forever
    // even though the image is already sitting in the browser's cache
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <figure ref={ref}>
      {/* the frame wipes open from the left as it scrolls in; clip-path keeps the
          reveal on the compositor and leaves layout untouched */}
      <motion.div
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: inView ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full overflow-hidden rounded-card bg-base-2 ring-1 ring-line-dark ${className}`}
      >
        {/* placeholder shown until a real file exists at `src` */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <span className="font-mono text-[11px] text-paper-soft">public{src}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-light">
            drop your photo here
          </span>
        </div>

        {!failed && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* a thin accent edge rides along with the wipe */}
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 0 : 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-accent-light"
        />
      </motion.div>
      {caption && (
        <figcaption className={`mt-3 text-sm ${captionClassName}`}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
