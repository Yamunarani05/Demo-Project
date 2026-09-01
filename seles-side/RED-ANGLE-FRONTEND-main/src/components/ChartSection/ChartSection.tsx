// src/components/ChartSection/ChartSection.tsx
import { useState, useMemo } from "react";

interface ChartData {
  month: string;
  leads: number;
}

interface ChartSectionProps {
  data: ChartData[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const ChartSection = ({ data, loading, error, onRetry }: ChartSectionProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
      {/* Header */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          Performance
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Monthly lead distribution
        </p>
      </div>

      {/* States */}
      {loading ? (
        <div className="h-56 sm:h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-[3px] border-[#6938ef] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Loading chart data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="h-56 sm:h-64 flex flex-col items-center justify-center text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-700 mb-3">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-1.5 bg-[#6938ef] text-white rounded-lg hover:opacity-90 text-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <LeadChart data={data} />
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full" />
          <span className="text-xs sm:text-sm text-gray-600 font-semibold">
            Achieved
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#6938ef] rounded-full" />
          <span className="text-xs sm:text-sm text-gray-600 font-semibold">
            Target
          </span>
        </div>
      </div>
    </div>
  );
};

interface LeadChartProps {
  data: ChartData[];
}

const LeadChart = ({ data }: LeadChartProps) => {
  const adapted = useMemo(
    () =>
      data.map((d) => ({
        month: d.month,
        achieved: d.leads,
        target: Math.max(d.leads - 2, 0),
      })),
    [data]
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const rawMax = Math.max(
    0,
    ...adapted.map((d) => Math.max(d.achieved, d.target))
  );
  const maxValue = rawMax <= 0 ? 2 : Math.ceil(rawMax / 2) * 2;

  const yAxisSteps: number[] = [];
  for (let v = 0; v <= maxValue; v += 2) yAxisSteps.push(v);

  const chartPadding = { top: 20, bottom: 36, left: 0, right: 0 };

  const getYPercent = (value: number) => {
    const usable = 100 - chartPadding.top - chartPadding.bottom;
    if (maxValue === 0) return chartPadding.top + usable;
    return chartPadding.top + (usable - (value / maxValue) * usable);
  };

  // Leave 5% margin on left and right so Dec is not touching the border
  const getXPercent = (index: number) => {
    if (adapted.length <= 1) return 50;
    const start = 5; // %
    const end = 95;  // %
    const span = end - start;
    return start + (index / (adapted.length - 1)) * span;
  };

  const achievedPath = adapted
    .map((p, i) => {
      const x = getXPercent(i);
      const y = getYPercent(p.achieved);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const targetPath = adapted
    .map((p, i) => {
      const x = getXPercent(i);
      const y = getYPercent(p.target);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="h-56 sm:h-64 relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs sm:text-sm text-gray-500 pr-2 font-medium">
        {yAxisSteps.map((num) => (
          <span key={num}>{num}</span>
        ))}
      </div>

      {/* Chart area */}
      <div
        className="ml-10 sm:ml-14 md:ml-16 h-full pb-7 relative"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <filter
              id="chartShadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="0"
                dy="0.5"
                stdDeviation="0.5"
                floodOpacity="0.2"
              />
            </filter>
          </defs>

          {/* Grid lines */}
          {yAxisSteps.slice(1).map((num) => {
            const y = getYPercent(num);
            return (
              <line
                key={num}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
            );
          })}

          {/* Target line (thin) */}
          <path
            d={targetPath}
            fill="none"
            stroke="#6938ef"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Achieved line (thin) */}
          <path
            d={achievedPath}
            fill="none"
            stroke="#f97316"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points + hover tooltip */}
          {adapted.map((point, index) => {
            const x = getXPercent(index);
            const achievedY = getYPercent(point.achieved);
            const targetY = getYPercent(point.target);
            const isHovered = hoveredIndex === index;

            return (
              <g key={index}>
                {/* Hover band */}
                <rect
                  x={x - 8}
                  y="0"
                  width="16"
                  height="100"
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(index)}
                  style={{ cursor: "pointer" }}
                />

                {/* Target point */}
                <circle
                  cx={x}
                  cy={targetY}
                  r={isHovered ? 1.2 : 0.8}
                  fill="#6938ef"
                  stroke="white"
                  strokeWidth={isHovered ? 0.5 : 0.3}
                />

                {/* Achieved point */}
                <circle
                  cx={x}
                  cy={achievedY}
                  r={isHovered ? 1.2 : 0.8}
                  fill="#f97316"
                  stroke="white"
                  strokeWidth={isHovered ? 0.5 : 0.3}
                />

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <line
                      x1={x}
                      y1={chartPadding.top}
                      x2={x}
                      y2={100 - chartPadding.bottom}
                      stroke="#9ca3af"
                      strokeWidth="0.4"
                      strokeDasharray="2,2"
                      opacity="0.5"
                    />
                    <rect
                      x={x - 12}
                      y={chartPadding.top - 15}
                      width="24"
                      height="12"
                      rx="1.5"
                      fill="white"
                      stroke="#e5e7eb"
                      strokeWidth="0.3"
                      filter="url(#chartShadow)"
                    />
                    <text
                      x={x}
                      y={chartPadding.top - 11}
                      textAnchor="middle"
                      fontSize="2.4"
                      fill="#f97316"
                      fontWeight="bold"
                    >
                      {Math.round(point.achieved)} Ach
                    </text>
                    <text
                      x={x}
                      y={chartPadding.top - 6}
                      textAnchor="middle"
                      fontSize="2.4"
                      fill="#6938ef"
                      fontWeight="bold"
                    >
                      {Math.round(point.target)} Tar
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
          {adapted.map((point, index) => {
            const xPercent = getXPercent(index);
            return (
              <div
                key={index}
                className="text-xs text-gray-600 text-center font-medium absolute"
                style={{
                  left: `${xPercent}%`,
                  transform: "translateX(-50%)",
                  minWidth: "50px",
                }}
              >
                {point.month}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChartSection;