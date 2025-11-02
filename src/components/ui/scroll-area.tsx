"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area@1.2.3";
import { cn } from "./utils";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  // ✅ ref for the actual scrollable viewport
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  // ✅ scroll to bottom when children change or new elements added
  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Scroll to the last child if it exists
    const lastChild = viewport.lastElementChild;
    if (lastChild) {
      // Smooth scroll so it looks natural
      (lastChild as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [children]);

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      dir="ltr"
      className={cn("relative max-h-96 flex-1 p-4", className)}
      style={{ overflow: "auto" }} // visible in DevTools
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef} // 👈 ref attached here
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
