import { cn } from "@/lib/cn";

/*
 * Cut-paper figures scattered behind the page, after the people on the
 * "Mon Absente" poster. Placeholders until the client supplies her own cutouts:
 * swap the shapes here, or replace <Figure> with <img> tags of her scans.
 */
const FIGURES = {
  stand: {
    box: "0 0 40 100",
    d: "M20 2a7 7 0 1 1 0 14a7 7 0 1 1 0-14ZM14 17q6-2 12 0l4 3q2 2 2 6l1 22q0 3-2 3h-1l-1 9h-2l-1 36q0 3-3 3h-1l-1-37h-2l-1 37h-1q-3 0-3-3l-1-36h-2l-1-9h-1q-2 0-2-3l1-22q0-4 2-6Z",
  },
  walk: {
    box: "0 0 40 100",
    d: "M21 2a7 7 0 1 1 0 14a7 7 0 1 1 0-14ZM15 17q6-2 12 0l3 3q2 3 2 7l3 19-3 1-3-13-1 22 6 22 2 19-4 1-4-18-7-18-6 18-6 16-4-1 6-19 3-20-1-22-2 13-3-1 2-19q0-4 2-7Z",
  },
  dress: {
    box: "0 0 40 100",
    d: "M20 3a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13ZM15 17q5-2 10 0l3 3q2 2 2 5l2 20-3 1-2-14 9 41H26l-1 24h-3l-1-24h-2l-1 24h-3l-1-24H4l9-41-2 14-3-1 2-20q0-3 2-5Z",
  },
  child: {
    box: "0 0 40 100",
    d: "M20 40a6 6 0 1 1 0 12a6 6 0 1 1 0-12ZM15 53q5-2 10 0l3 3q1 2 1 4l1 13-3 1-1-8-1 6v27h-3l-1-22h-2l-1 22h-3V72l-1-6-1 8-3-1 1-13q0-2 1-4Z",
  },
  crouch: {
    box: "0 0 56 100",
    d: "M24 46a7 7 0 1 1 0 14a7 7 0 1 1 0-14ZM19 61q8-3 15 2l6 10 6 12q3 6-1 9l-7 5h-4l1-4 5-4-5-8-3 16H17q-4 0-4-4l3-14-6 4-2-3 9-12Z",
  },
};

// [shape, top %, left or right edge, offset %, height px, tilt]
const PLACES = [
  ["walk", 6, "right", 3, 150, 0],
  ["stand", 17, "left", 2, 170, 0],
  ["child", 27, "right", 7, 120, 0],
  ["dress", 38, "left", 6, 160, 0],
  ["crouch", 49, "right", 2, 120, 0],
  ["stand", 60, "left", 1, 150, -2],
  ["walk", 71, "right", 6, 170, 0],
  ["dress", 82, "left", 4, 140, 2],
];

export function Silhouettes({ className }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {PLACES.map(([shape, top, side, offset, height, tilt], i) => {
        const { box, d } = FIGURES[shape];
        const [, , w, h] = box.split(" ").map(Number);
        return (
          <svg
            key={i}
            viewBox={box}
            width={(height * w) / h}
            height={height}
            className={cn("absolute text-sky", i % 2 ? "opacity-30" : "opacity-40", i > 3 && "hidden md:block")}
            style={{ top: `${top}%`, [side]: `${offset}%`, transform: `rotate(${tilt}deg) ${side === "right" ? "scaleX(-1)" : ""}` }}
          >
            <path d={d} fill="currentColor" />
          </svg>
        );
      })}
    </div>
  );
}
