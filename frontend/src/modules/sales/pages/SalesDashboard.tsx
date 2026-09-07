import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  TrendingUp,
  FileText,
  Clock,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AnimatedCounter } from '../../master/components/MasterMotion';

interface ChartPoint {
  month: string;
  achieved: number;
  target: number;
}

const FIVE_MONTHS_DATA: ChartPoint[] = [
  { month: 'May 2026', achieved: 1, target: 1 },
  { month: 'Jun 2026', achieved: 1, target: 1 },
  { month: 'Jul 2026', achieved: 1, target: 1 },
  { month: 'Aug 2026', achieved: 3, target: 5 },
  { month: 'Sept 2026', achieved: 1, target: 2 },
];

export default function SalesDashboard() {
  const navigate = useNavigate();
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(3);
  const [dateFilter, setDateFilter] = useState('2026-09-01');

  // 5 Stat Cards matching Screenshot 1 exactly
  const statCards = [
    {
      title: 'Employees',
      subtitle: 'Total employees',
      value: 6,
      color: 'bg-cyan-50 text-cyan-600',
      icon: Users,
      path: '/sales/employees',
    },
    {
      title: 'Leads',
      subtitle: 'Total leads',
      value: 4,
      color: 'bg-emerald-50 text-emerald-600',
      icon: UserCheck,
      path: '/sales/view-leads',
    },
    {
      title: 'Pending Leads',
      subtitle: 'Awaiting action',
      value: 3,
      color: 'bg-orange-50 text-orange-500',
      icon: TrendingUp,
      path: '/sales/assign-leads',
    },
    {
      title: 'Invoices',
      subtitle: 'Created invoices',
      value: 1,
      color: 'bg-sky-50 text-sky-500',
      icon: FileText,
      path: '/sales/invoice',
    },
    {
      title: 'Pending Invoices',
      subtitle: 'Awaiting payment',
      value: 1,
      color: 'bg-rose-50 text-rose-500',
      icon: Clock,
      path: '/sales/invoice',
    },
  ];

  // SVG Spline Chart Calculations
  const chartPadding = { top: 20, bottom: 35, left: 10, right: 10 };
  const rawMax = Math.max(0, ...FIVE_MONTHS_DATA.map((d) => Math.max(d.achieved, d.target)));
  const maxValue = rawMax <= 0 ? 6 : Math.ceil(rawMax / 2) * 2 + 1; // 6 max

  const getYPercent = (val: number) => {
    const usableHeight = 100 - chartPadding.top - chartPadding.bottom;
    return chartPadding.top + (usableHeight - (val / maxValue) * usableHeight);
  };

  const getXPercent = (idx: number) => {
    const span = 100 - chartPadding.left - chartPadding.right;
    return chartPadding.left + (idx / (FIVE_MONTHS_DATA.length - 1)) * span;
  };

  const achievedPoints = FIVE_MONTHS_DATA.map((p, i) => ({
    x: getXPercent(i),
    y: getYPercent(p.achieved),
  }));

  const targetPoints = FIVE_MONTHS_DATA.map((p, i) => ({
    x: getXPercent(i),
    y: getYPercent(p.target),
  }));

  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    const d: string[] = [];
    d.push(`M ${pts[0].x} ${pts[0].y}`);

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const smoothing = 0.2;
      const cp1x = p1.x + ((p2.x - p0.x) / 6) * smoothing * 3;
      const cp1y = p1.y + ((p2.y - p0.y) / 6) * smoothing * 3;
      const cp2x = p2.x - ((p3.x - p1.x) / 6) * smoothing * 3;
      const cp2y = p2.y - ((p3.y - p1.y) / 6) * smoothing * 3;

      d.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`);
    }

    return d.join(' ');
  };

  const achievedPath = buildSmoothPath(achievedPoints);
  const targetPath = buildSmoothPath(targetPoints);

  const achievedAreaPath =
    achievedPoints.length > 0
      ? [
          `M ${achievedPoints[0].x} ${100 - chartPadding.bottom}`,
          ...achievedPoints.map((p) => `L ${p.x} ${p.y}`),
          `L ${achievedPoints[achievedPoints.length - 1].x} ${100 - chartPadding.bottom}`,
          'Z',
        ].join(' ')
      : '';

  return (
    <div className="space-y-6 font-sans">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#17152B] tracking-tight">
          Admin Dashboard
        </h1>
      </div>

      {/* 5 Stat Cards Row matching Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-2xl shadow-xs border border-[#E5E1F2] p-4.5 cursor-pointer hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#68647A]">
                    {card.subtitle}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#17152B] mt-0.5">
                    {card.title}
                  </h3>
                  <div className="text-2xl font-black text-[#17152B] mt-2">
                    <AnimatedCounter end={card.value} />
                  </div>
                </div>

                <div className={`p-2.5 rounded-full ${card.color} group-hover:scale-110 transition-transform shadow-2xs shrink-0`}>
                  <Icon size={20} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Spline Chart Card matching Screenshot 1 */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xs border border-[#E5E1F2] p-6 relative overflow-hidden"
      >
        {/* Header with Title and Date Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-extrabold text-[#17152B]">
              Performance
            </h2>
            <p className="text-xs text-[#68647A] mt-0.5">
              Achieved vs total leads in the last 5 months
            </p>
          </div>

          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#17152B] focus:outline-none focus:ring-2 focus:ring-[#5B42F3] transition-all cursor-pointer shadow-2xs"
            />
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="relative w-full h-64 sm:h-72">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="achievedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle horizontal grid lines */}
            {[0.25, 0.5, 0.75].map((ratio) => {
              const usableHeight = 100 - chartPadding.top - chartPadding.bottom;
              const y = chartPadding.top + usableHeight * (1 - ratio);
              return (
                <line
                  key={ratio}
                  x1="5"
                  y1={y}
                  x2="95"
                  y2={y}
                  stroke="#F1F3F9"
                  strokeWidth="0.4"
                />
              );
            })}

            {/* Baseline axis */}
            <line
              x1="5"
              y1={100 - chartPadding.bottom}
              x2="95"
              y2={100 - chartPadding.bottom}
              stroke="#E5E7EB"
              strokeWidth="0.5"
            />

            {/* Achieved Area Gradient Fill */}
            {achievedAreaPath && (
              <motion.path
                d={achievedAreaPath}
                fill="url(#achievedGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
            )}

            {/* Target Purple Line */}
            {targetPath && (
              <motion.path
                d={targetPath}
                fill="none"
                stroke="#6938ef"
                strokeWidth="0.85"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
            )}

            {/* Achieved Orange Line */}
            {achievedPath && (
              <motion.path
                d={achievedPath}
                fill="none"
                stroke="#f97316"
                strokeWidth="0.95"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut', delay: 0.1 }}
              />
            )}

            {/* Interactive Data Point Dots */}
            {FIVE_MONTHS_DATA.map((p, idx) => {
              const x = getXPercent(idx);
              const targetY = getYPercent(p.target);
              const achievedY = getYPercent(p.achieved);
              const isHovered = hoveredPointIndex === idx;

              return (
                <g key={idx}>
                  {/* Invisible broad hover trigger area */}
                  <rect
                    x={x - 4}
                    y={chartPadding.top}
                    width="8"
                    height={100 - chartPadding.top - chartPadding.bottom}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    style={{ cursor: 'pointer' }}
                  />

                  {/* Target dot (Purple) */}
                  <circle
                    cx={x}
                    cy={targetY}
                    r={isHovered ? 1.6 : 1.0}
                    fill="#6938ef"
                    stroke="white"
                    strokeWidth={isHovered ? 0.4 : 0.25}
                    className="transition-all duration-200"
                  />

                  {/* Achieved dot (Orange) */}
                  <circle
                    cx={x}
                    cy={achievedY}
                    r={isHovered ? 1.8 : 1.1}
                    fill="#f97316"
                    stroke="white"
                    strokeWidth={isHovered ? 0.45 : 0.3}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}
          </svg>

          {/* Month Labels along X-Axis */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-6 text-[11px] font-semibold text-[#68647A]">
            {FIVE_MONTHS_DATA.map((p, idx) => (
              <div
                key={idx}
                onClick={() => setHoveredPointIndex(idx)}
                className={`cursor-pointer transition-colors ${
                  hoveredPointIndex === idx ? 'text-[#17152B] font-bold' : ''
                }`}
              >
                {p.month}
              </div>
            ))}
          </div>

          {/* Floating Tooltip when hovering over a month */}
          {hoveredPointIndex !== null && (
            <div
              className="absolute top-4 pointer-events-none transition-all duration-300"
              style={{
                left: `${getXPercent(hoveredPointIndex)}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="bg-[#17152B] text-white text-[11px] py-1.5 px-3 rounded-xl shadow-xl space-y-1">
                <div className="font-extrabold text-white text-center border-b border-white/20 pb-0.5">
                  {FIVE_MONTHS_DATA[hoveredPointIndex].month}
                </div>
                <div className="flex items-center justify-between gap-3 text-orange-400 font-bold">
                  <span>Achieved:</span>
                  <span>{FIVE_MONTHS_DATA[hoveredPointIndex].achieved}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-purple-300 font-bold">
                  <span>Target:</span>
                  <span>{FIVE_MONTHS_DATA[hoveredPointIndex].target}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend at bottom matching Screenshot 1 */}
        <div className="mt-4 pt-4 border-t border-[#E5E1F2] flex items-center justify-center gap-8 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#f97316] inline-block shadow-2xs" />
            <span className="text-[#17152B]">Achieved (Completed)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#6938ef] inline-block shadow-2xs" />
            <span className="text-[#17152B]">Target (Total Leads)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
