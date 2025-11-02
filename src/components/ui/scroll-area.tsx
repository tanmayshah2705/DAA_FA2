"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area@1.2.3";
import { cn } from "./utils";

function ScrollArea({
  className,
  children,
  scrollBehavior = "smooth",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  /** "smooth" | "auto" */
  scrollBehavior?: "smooth" | "auto";
}) {
  // ref to the actual scroll container (Radix Viewport)
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  // helper to scroll the last element into view
  const scrollLastIntoView = React.useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const last = viewport.lastElementChild;
      if (last) {
        // If the last child itself is not focusable/visible, use scrollIntoView on it.
        // block: "nearest" prevents excessive jump; change to "end" if you want bottom-aligned.
        try {
          (last as HTMLElement).scrollIntoView({
            behavior,
            block: "nearest",
            inline: "nearest",
          });
        } catch {
          // fallback to setting scrollTop
          viewport.scrollTop = viewport.scrollHeight;
        }
      } else {
        // fallback: no children — just scroll to bottom
        viewport.scrollTop = viewport.scrollHeight;
      }
    },
    [],
  );

  // Observe DOM changes inside the viewport (covers dynamic insertions)
  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const mo = new MutationObserver((mutations) => {
      // If nodes were added, scroll the last added into view
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length > 0) {
          // small timeout to allow layout to settle
          requestAnimationFrame(() => scrollLastIntoView(scrollBehavior));
          break;
        }
      }
    });

    mo.observe(viewport, { childList: true, subtree: false });
    return () => mo.disconnect();
  }, [scrollLastIntoView, scrollBehavior]);

  // Also run when React children change (covers React-controlled updates)
  React.useEffect(() => {
    // schedule after paint/layout
    requestAnimationFrame(() => scrollLastIntoView(scrollBehavior));
  }, [children, scrollLastIntoView, scrollBehavior]);

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      dir="ltr"
      className={cn("relative max-h-96 flex-1 p-4", className)}
      style={{ overflow: "auto" }} // inline style visible in DevTools
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        // IMPORTANT: attach ref to Viewport — this is the real scroll container
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
