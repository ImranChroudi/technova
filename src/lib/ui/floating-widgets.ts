"use client";

export type FloatingWidget = "chat" | "visual";

const OPEN_EVENT = "shopclone:floating-widget-open";
let activeWidget: FloatingWidget | null = null;

/** Tell the other floating widget to close when this one opens. */
export function announceFloatingWidgetOpen(widget: FloatingWidget) {
  if (typeof window === "undefined") return;
  setFloatingWidgetOpen(widget, true);
  window.dispatchEvent(new CustomEvent<FloatingWidget>(OPEN_EVENT, { detail: widget }));
}

/** Track which panel is open so the floating buttons can hide behind it. */
export function setFloatingWidgetOpen(widget: FloatingWidget, open: boolean) {
  if (typeof document === "undefined") return;
  if (open) activeWidget = widget;
  else if (activeWidget === widget) activeWidget = null;
  document.body.dataset.floatingWidgetOpen = activeWidget ? "true" : "false";
}

/** Listen for the other widget opening. Returns an unsubscribe function. */
export function onOtherFloatingWidgetOpen(
  widget: FloatingWidget,
  onOpen: () => void
) {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    if ((event as CustomEvent<FloatingWidget>).detail !== widget) onOpen();
  };

  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
