import { Position, RGB, Size } from "../types";
import { Worker } from "../addon";
import { normalizeWindowInfo, stringsToBuffers } from "../utils";

type SetWorkwindow = {
  /** Sets current workwindow by `handle`. */
  (handle?: number): void;
  /** Sets current workwindow by first window with `title` and/or `className` and sets it as current workwindow. */
  (title: string | null, className?: string | null): void;
  /** Sets current workwindow by first child window with `childClassName` and/or `childTitle` of window with `parentHandle`. */
  (
    parentHandle: number,
    childClassName: string | null,
    childTitle?: string | null
  ): void;
  /** Sets current workwindow by first child window with `childClassName` and/or `childTitle` of the first founded window with `parentTitle` and/or `parentClassName`. */
  (
    parentTitle: string | null,
    parentClassName: string | null,
    childClassName: string | null,
    childTitle?: string | null
  ): void;
};

export const handleSetWorkwindow =
  (worker: Worker): SetWorkwindow =>
  (...args: any[]) => {
    worker.setWorkwindow(...stringsToBuffers(args));
  };

type ColorAt = {
  /**
   * @param format - type of return value, "string" for hexadecimal color representation "rrggbb", "array" for array representation of color [r,g,b], "number" for color representation in decimal, if not provided defaults to "string".
   * @returns pixel color in [x, y] of current workwindow (or screen if `handle` was unset).
   */
  (x: number, y: number, format?: "string"): string;
  (x: number, y: number, format: "array"): RGB;
  (x: number, y: number, format: "number"): number;
};

const handleWorkwindow = (worker: Worker) => {
  const _add0 = (item: string) => (item.length > 1 ? item : "0" + item);

  const _hex = (...rgb: RGB) =>
    rgb.reduce((hex, color) => hex + _add0(color.toString(16)), "");

  const colorAt: ColorAt = (
    x: number,
    y: number,
    format: "string" | "array" | "number" = "string"
  ): any => {
    const bgr = worker.getColor(x, y);

    const r = bgr & 0xff;
    const g = (bgr >> 8) & 0xff;
    const b = (bgr >> 16) & 0xff;

    switch (format) {
      case "array":
        return [r, g, b];

      case "number":
        return (r << 16) | (g << 8) | b;

      case "string":
        return _hex(r, g, b);

      default:
        throw new Error("wrong format");
    }
  };

  return {
    refresh: worker.refresh,
    setForeground: worker.setForeground,
    isForeground: worker.isForeground,
    isOpen: worker.isOpen,
    capture: worker.capture,
    kill: worker.kill,
    close: worker.close,

    set view(view: Position & Size) {
      worker.windowView = view;
    },

    get view() {
      return worker.windowView;
    },

    set: handleSetWorkwindow(worker),

    get: () => normalizeWindowInfo(worker.getWorkwindow()),

    colorAt,
  };
};

export default handleWorkwindow;
