"use client";

import { useId, useState } from "react";

// Power of a two-sided, two-sample z-test with n users per group and effect size d.
// Normal CDF via the Abramowitz–Stegun approximation (same as the mockup).
function powerAt(n: number, d: number) {
  const x = d * Math.sqrt(n / 2) - 1.959964;
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const k = 0.3989423 * Math.exp((-x * x) / 2);
  const p = k * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

const L = 48, T = 16, W = 576, H = 244, NMAX = 2000;
const y80 = T + 0.2 * H;
const yTicks = [100, 80, 60, 40, 20, 0];
const gridTicks = [100, 60, 40, 20]; // 80% gets the dashed reference line instead
const xTicks = [0, 500, 1000, 1500, 2000];

export default function PowerCurve() {
  const [d, setD] = useState(0.2);
  const id = useId();
  const fillId = `fill${id.replace(/[^\w-]/g, "")}`;

  const pts: string[] = [];
  for (let n = 0; n <= NMAX; n += 20) {
    pts.push(`${(L + (n / NMAX) * W).toFixed(1)} ${(T + (1 - powerAt(n, d)) * H).toFixed(1)}`);
  }
  const curve = `M ${pts.join(" L ")}`;
  const area = `${curve} L ${L + W} ${T + H} L ${L} ${T + H} Z`;
  const n80 = Math.ceil(2 * Math.pow((1.959964 + 0.841621) / d, 2));
  const inRange = n80 <= NMAX;
  const mx = L + (Math.min(n80, NMAX) / NMAX) * W;
  const n80Label = n80.toLocaleString("en-US");

  return (
    <div className="power">
      <div className="power-controls">
        <label htmlFor={id} className="power-label">
          Effect size <i className="power-var">d</i> = <span className="power-value">{d.toFixed(2)}</span>
        </label>
        <input id={id} type="range" min={0.08} max={0.5} step={0.01} value={d} onChange={(e) => setD(Number(e.target.value))} />
      </div>
      <svg viewBox="0 0 640 300" role="img" aria-label={`Power by sample size per group, for effect size d = ${d.toFixed(2)}`}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="var(--chart-grid)" strokeWidth="1">
          {gridTicks.map((v) => {
            const y = T + (1 - v / 100) * H;
            return <line key={v} x1={L} y1={y} x2={L + W} y2={y} />;
          })}
        </g>
        <line x1={L} y1={y80} x2={L + W} y2={y80} stroke="var(--chart-ref)" strokeDasharray="4 4" />
        <line x1={L} y1={T + H} x2={L + W} y2={T + H} stroke="var(--chart-axis)" />
        <g className="power-axis" textAnchor="end">
          {yTicks.map((v) => (
            <text key={v} x={40} y={T + (1 - v / 100) * H + 4}>{v}%</text>
          ))}
        </g>
        <g className="power-axis" textAnchor="middle">
          {xTicks.map((v) => (
            <text key={v} x={L + (v / NMAX) * W} y={280}>{v.toLocaleString("en-US")}</text>
          ))}
          <text x={L + W / 2} y={298}>users per group</text>
        </g>
        <path d={area} fill={`url(#${fillId})`} />
        <path d={curve} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {inRange && (
          <g>
            <line x1={mx} y1={y80} x2={mx} y2={T + H} stroke="var(--accent)" strokeDasharray="3 3" />
            <circle cx={mx} cy={y80} r="5" fill="var(--card)" stroke="var(--accent)" strokeWidth="2.5" />
            <text x={Math.min(mx + 10, L + W - 84)} y={52} className="power-mark">n = {n80Label}</text>
          </g>
        )}
      </svg>
      <div className="power-foot">
        <span>
          80% power needs <strong>{n80Label}</strong> users per group
        </span>
        <span className="power-alpha">α = 0.05, two-sided</span>
      </div>
    </div>
  );
}
