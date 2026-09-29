"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/locale";

export interface ChartPoint {
  month: number;
  balance: number;
}

interface PayoffChartProps {
  baseline: ChartPoint[];
  whatIf?: ChartPoint[] | null;
  currency: string;
  locale: string;
  title: string;
  baselineLabel: string;
  whatIfLabel: string;
  xAxisLabel: string;
}

const WIDTH = 600;
const HEIGHT = 320;
const PADDING = { top: 16, right: 16, bottom: 40, left: 64 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;
const TICK_COUNT = 6;
const X_TICK_COUNT = 6;

function niceTicks(max: number, count: number): number[] {
  if (max <= 0) return [0];
  const rawStep = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;

  const ticks: number[] = [];
  for (let t = 0; t <= max + step * 0.001; t += step) {
    ticks.push(Math.round(t * 100) / 100);
  }
  return ticks;
}

/**
 * Deterministic, currency-symbol-free compact number formatting (e.g.
 * "7K", "1.5K") — used only for the chart's tick labels before hydration,
 * as a hydration-safe stand-in for Intl's locale-formatted version. Plain
 * arithmetic and string formatting, so it can never differ between Node
 * and a browser the way Intl's compact notation has.
 */
function plainCompact(n: number): string {
  if (n >= 1000) {
    const thousands = n / 1000;
    const rounded = Math.round(thousands * 10) / 10;
    return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}K`;
  }
  return Math.round(n).toString();
}

/** Pads a series with trailing zero-balance points so both lines share an x-domain. */
function padSeries(points: ChartPoint[], throughMonth: number): ChartPoint[] {
  const last = points.at(-1);
  if (!last || last.month >= throughMonth) return points;
  return [...points, { month: throughMonth, balance: 0 }];
}

function pathFor(points: ChartPoint[], xScale: (m: number) => number, yScale: (b: number) => number): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.month).toFixed(2)} ${yScale(p.balance).toFixed(2)}`).join(" ");
}

export function PayoffChart({ baseline, whatIf, currency, locale, title, baselineLabel, whatIfLabel, xAxisLabel }: PayoffChartProps) {
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);

  // Intl's compact-notation output for the exact same input has now been
  // caught differing between Node (SSR/build) and Chromium (client) twice —
  // once in trailing-zero trimming ("$7.0K" vs "$7K"), once in the unit
  // suffix's letter case for en-GB specifically ("£1K" vs "£1k"). The chart
  // renders in the initial server-rendered HTML (results are pre-filled by
  // default now), so any such divergence is a hydration mismatch. Rather
  // than keep patching individual locale/rounding cases as they turn up,
  // tick labels use a plain, currency-symbol-free fallback (identical on
  // every engine, no Intl involved) until mounted, then switch to the real
  // formatter — the same pattern already used for the currency dropdown.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const maxMonth = Math.max(baseline.at(-1)?.month ?? 0, whatIf?.at(-1)?.month ?? 0, 1);
  const maxBalance = Math.max(baseline[0]?.balance ?? 0, 1);

  const paddedBaseline = useMemo(() => padSeries(baseline, maxMonth), [baseline, maxMonth]);
  const paddedWhatIf = useMemo(() => (whatIf ? padSeries(whatIf, maxMonth) : null), [whatIf, maxMonth]);

  const xScale = (month: number) => PADDING.left + (month / maxMonth) * PLOT_WIDTH;
  const yScale = (balance: number) => PADDING.top + (1 - balance / maxBalance) * PLOT_HEIGHT;

  const yTicks = niceTicks(maxBalance, TICK_COUNT).filter((t) => t <= maxBalance * 1.001);

  const intlTickFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    [locale, currency],
  );
  const tickFormatter = { format: (n: number) => (mounted ? intlTickFormatter.format(n) : plainCompact(n)) };

  function balanceAt(points: ChartPoint[], month: number): number {
    const clamped = Math.max(0, Math.min(month, points.at(-1)?.month ?? 0));
    return points[Math.min(clamped, points.length - 1)]?.balance ?? 0;
  }

  function monthFromClientX(svg: SVGSVGElement, clientX: number): number {
    const rect = svg.getBoundingClientRect();
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
    const viewBoxX = ratio * WIDTH;
    const raw = ((viewBoxX - PADDING.left) / PLOT_WIDTH) * maxMonth;
    return Math.round(Math.max(0, Math.min(raw, maxMonth)));
  }

  const hasWhatIf = Boolean(paddedWhatIf && paddedWhatIf.length > 0);
  const crosshairX = hoverMonth !== null ? xScale(hoverMonth) : null;
  const tooltipOnLeft = crosshairX !== null && crosshairX > PADDING.left + PLOT_WIDTH * 0.65;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {/* A single series needs no legend — the title already says what's plotted. */}
        {hasWhatIf && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/75">
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ background: "var(--chart-series-1)" }} />
              {baselineLabel}
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ background: "var(--chart-series-2)" }} />
              {whatIfLabel}
            </li>
          </ul>
        )}
      </div>
      <div className="mt-2 h-72 w-full" style={{ background: "var(--chart-surface)" }}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label={`${title}: ${baselineLabel} reaches zero at month ${baseline.at(-1)?.month ?? 0}${
            hasWhatIf ? `; ${whatIfLabel} reaches zero at month ${whatIf?.at(-1)?.month ?? 0}` : ""
          }.`}
          tabIndex={0}
          onPointerMove={(e) => setHoverMonth(monthFromClientX(e.currentTarget, e.clientX))}
          onPointerLeave={() => setHoverMonth(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              setHoverMonth((m) => Math.min(maxMonth, (m ?? 0) + 1));
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              setHoverMonth((m) => Math.max(0, (m ?? maxMonth) - 1));
            } else if (e.key === "Escape") {
              setHoverMonth(null);
            }
          }}
        >
          {/* Gridlines + y-axis labels */}
          {yTicks.map((tick) => {
            const y = yScale(tick);
            return (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  x2={WIDTH - PADDING.right}
                  y1={y}
                  y2={y}
                  stroke="var(--chart-gridline)"
                  strokeWidth={1}
                />
                <text x={PADDING.left - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--chart-text-muted)">
                  {tickFormatter.format(tick)}
                </text>
              </g>
            );
          })}

          {/* Baseline axis */}
          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={HEIGHT - PADDING.bottom}
            y2={HEIGHT - PADDING.bottom}
            stroke="var(--chart-axis)"
            strokeWidth={1}
          />

          {/* X-axis month labels */}
          {niceTicks(maxMonth, X_TICK_COUNT)
            .filter((t) => t > 0 && t <= maxMonth * 1.001)
            .map((t) => (
              <text
                key={`x-${t}`}
                x={xScale(t)}
                y={HEIGHT - PADDING.bottom + 18}
                textAnchor="middle"
                fontSize={11}
                fill="var(--chart-text-muted)"
              >
                {Math.round(t)}
              </text>
            ))}
          <text x={PADDING.left} y={HEIGHT - 4} fontSize={10} fill="var(--chart-text-muted)">
            {xAxisLabel}
          </text>

          {/* Series lines */}
          <path
            d={pathFor(paddedBaseline, xScale, yScale)}
            fill="none"
            stroke="var(--chart-series-1)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {hasWhatIf && paddedWhatIf && (
            <path
              d={pathFor(paddedWhatIf, xScale, yScale)}
              fill="none"
              stroke="var(--chart-series-2)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* End-of-line markers. No direct text labels: both series converge
              near $0 at the right edge, so direct labels would collide —
              the legend below the chart carries identity instead, per the
              dataviz skill's guidance for converging lines. */}
          <EndMarker points={paddedBaseline} xScale={xScale} yScale={yScale} color="var(--chart-series-1)" />
          {hasWhatIf && paddedWhatIf && (
            <EndMarker points={paddedWhatIf} xScale={xScale} yScale={yScale} color="var(--chart-series-2)" />
          )}

          {/* Crosshair + tooltip */}
          {crosshairX !== null && hoverMonth !== null && (
            <g>
              <line x1={crosshairX} x2={crosshairX} y1={PADDING.top} y2={HEIGHT - PADDING.bottom} stroke="var(--chart-axis)" strokeWidth={1} />
              <ChartTooltip
                x={crosshairX}
                flip={tooltipOnLeft}
                month={hoverMonth}
                rows={[
                  { label: baselineLabel, value: balanceAt(paddedBaseline, hoverMonth), color: "var(--chart-series-1)" },
                  ...(hasWhatIf && paddedWhatIf
                    ? [{ label: whatIfLabel, value: balanceAt(paddedWhatIf, hoverMonth), color: "var(--chart-series-2)" }]
                    : []),
                ]}
                currency={currency}
                locale={locale}
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

function EndMarker({
  points,
  xScale,
  yScale,
  color,
}: {
  points: ChartPoint[];
  xScale: (m: number) => number;
  yScale: (b: number) => number;
  color: string;
}) {
  // Find the point where this series actually reaches 0 (not the padded tail).
  const zeroIndex = points.findIndex((p) => p.balance === 0);
  const point = zeroIndex >= 0 ? points[zeroIndex] : points.at(-1);
  if (!point) return null;
  const x = xScale(point.month);
  const y = yScale(point.balance);

  return <circle cx={x} cy={y} r={4} fill={color} stroke="var(--chart-surface)" strokeWidth={2} />;
}

function ChartTooltip({
  x,
  flip,
  month,
  rows,
  currency,
  locale,
}: {
  x: number;
  flip: boolean;
  month: number;
  rows: { label: string; value: number; color: string }[];
  currency: string;
  locale: string;
}) {
  const boxWidth = 168;
  const boxHeight = 24 + rows.length * 18;
  const boxX = flip ? x - boxWidth - 10 : x + 10;
  const boxY = PADDING.top;

  return (
    <g>
      <rect
        x={boxX}
        y={boxY}
        width={boxWidth}
        height={boxHeight}
        rx={6}
        fill="var(--chart-surface)"
        stroke="var(--chart-gridline)"
        strokeWidth={1}
      />
      <text x={boxX + 10} y={boxY + 16} fontSize={11} fill="var(--chart-text-muted)">
        Month {month}
      </text>
      {rows.map((row, i) => (
        <g key={row.label}>
          <line
            x1={boxX + 10}
            x2={boxX + 22}
            y1={boxY + 32 + i * 18}
            y2={boxY + 32 + i * 18}
            stroke={row.color}
            strokeWidth={2}
          />
          <text x={boxX + 28} y={boxY + 36 + i * 18} fontSize={11} fill="var(--chart-text-secondary)">
            {row.label}
          </text>
          <text x={boxX + boxWidth - 10} y={boxY + 36 + i * 18} textAnchor="end" fontSize={11} fontWeight={600} fill="var(--chart-text-primary)">
            {formatCurrency(row.value, currency, locale)}
          </text>
        </g>
      ))}
    </g>
  );
}
