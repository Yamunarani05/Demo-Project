// src/components/LeadChart/LeadChart.tsx
import { useState, useEffect, useMemo } from "react";

interface ChartData {
  month: string;
  leads: number;
}

interface LeadChartProps {
  data: ChartData[];
}

const LeadChart = ({ data }: LeadChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [maxValue, setMaxValue] = useState(12);

  const chartStats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        maxValue: 12,
        maxLeads: 0,
        totalLeads: 0,
      };
    }

    const leadsValues = data.map((item) => item.leads);
    const maxLeads = Math.max(...leadsValues);
    const totalLeads = leadsValues.reduce((sum, v) => sum + v, 0);
    const niceMax = Math.max(12, maxLeads);

    return {
      maxValue: niceMax,
      maxLeads,
      totalLeads,
    };
  }, [data]);

  useEffect(() => {
    setMaxValue(chartStats.maxValue);
  }, [chartStats]);

  const chartPadding = { top: 20, bottom: 40, left: 0, right: 0 };

  const getY = (value: number) => {
    const usable = 100 - chartPadding.top - chartPadding.bottom;
    if (maxValue === 0) return chartPadding.top + usable;
    return (
      chartPadding.top + (usable - (value / maxValue) * usable)
    );
  };

  const getX = (index: number) => {
    if (!data || data.length <= 1) return 50;
    return ((index + 0.5) / data.length) * 100;
  };

  const getBarWidth = () => {
    if (!data || data.length === 0) return 6;
    return Math.min(10, 80 / data.length);
  };

  const linePath =
    data && data.length > 0
      ? data
          .map((p, i) => {
            const x = getX(i);
            const y = getY(p.leads);
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
      : "";

  const hasData = data && data.length > 0;

  return (
    <div className="w-full h-[260px] relative overflow-hidden">
      {!hasData ? (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
          No data available
        </div>
      ) : (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            {/* background stripes */}
            <pattern
              id="bgStripes"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="2" height="4" fill="#ede9fe" />
            </pattern>

            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="0.8"
                floodColor="#000"
                floodOpacity="0.15"
              />
            </filter>
          </defs>

          {/* background striped bars */}
          {data.map((p, i) => {
            const x = getX(i);
            const barW = getBarWidth();
            return (
              <rect
                key={`bg-${i}`}
                x={x - barW / 2}
                y={chartPadding.top}
                width={barW}
                height={100 - chartPadding.top - chartPadding.bottom}
                fill="url(#bgStripes)"
                rx="2"
              />
            );
          })}

          {/* main bars + hover */}
          {data.map((p, i) => {
            const x = getX(i);
            const y = getY(p.leads);
            const barW = getBarWidth();
            const h = 100 - chartPadding.bottom - y;
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                <rect
                  x={x - barW}
                  y={chartPadding.top}
                  width={barW * 2}
                  height={100 - chartPadding.top - chartPadding.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: "pointer" }}
                />
                <rect
                  x={x - barW / 2}
                  y={y}
                  width={barW}
                  height={h}
                  fill="#7c3aed"
                  opacity={isHovered ? 1 : 0.85}
                  rx="2"
                  filter="url(#shadow)"
                />
              </g>
            );
          })}

          {/* line on top of bars */}
          {linePath && (
            <>
              <path
                d={linePath}
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={linePath}
                fill="none"
                stroke="#6938ef"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* dots + tooltip */}
          {data.map((p, i) => {
            const x = getX(i);
            const y = getY(p.leads);
            const isHovered = hoveredIndex === i;

            return (
              <g key={`dot-${i}`}>
                {isHovered && (
                  <>
                    <line
                      x1={x}
                      y1={chartPadding.top}
                      x2={x}
                      y2={100 - chartPadding.bottom}
                      stroke="#a855f7"
                      strokeWidth="0.3"
                      strokeDasharray="2,2"
                      opacity="0.6"
                    />
                    <g>
                      <rect
                        x={x - 12}
                        y={y - 23}
                        width="24"
                        height="16"
                        fill="white"
                        stroke="#6938ef"
                        strokeWidth="0.4"
                        rx="4"
                        filter="url(#shadow)"
                      />
                      <text
                        x={x}
                        y={y - 17}
                        textAnchor="middle"
                        fontSize="4"
                        fill="#6938ef"
                        fontWeight="bold"
                      >
                        {p.leads}
                      </text>
                      <text
                        x={x}
                        y={y - 11}
                        textAnchor="middle"
                        fontSize="3.3"
                        fill="#6b7280"
                      >
                        {p.month}
                      </text>
                    </g>
                  </>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 1.8 : 1.2}
                  fill="white"
                  stroke="#7c3aed"
                  strokeWidth="0.7"
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* numbers above bars */}
      {hasData && (
        <div className="pointer-events-none absolute inset-x-0 top-1 text-[10px] sm:text-xs font-semibold">
          {data.map((p, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;
            return (
              <div
                key={`num-${i}`}
                className={`absolute -translate-x-1/2 ${
                  isHovered ? "text-purple-700 scale-110" : "text-gray-900"
                } transition-transform`}
                style={{ left: `${x}%` }}
              >
                {p.leads}
              </div>
            );
          })}
        </div>
      )}

      {/* month labels */}
      {hasData && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-2 text-[10px] sm:text-xs">
          {data.map((p, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;
            return (
              <div
                key={`label-${i}`}
                className={`absolute -translate-x-1/2 ${
                  isHovered ? "text-[#6938ef] font-semibold" : "text-gray-600"
                }`}
                style={{ left: `${x}%` }}
              >
                {p.month}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeadChart;
