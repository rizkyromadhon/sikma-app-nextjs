"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  // Legend,
} from "recharts";
import { useTheme } from "next-themes";
import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface StudentsByProdiChartProps {
  data: { name: string; male: number; female: number }[];
  sidebarCollapsed?: boolean;
}

const COLORS_PIE = ["#60A5FA", "#8B5CF6"];
const COLORS_BAR = ["#60A5FA", "#8B5CF6"];

const CustomBarTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  if (!active || !payload?.length) return null;

  return (
    <div
      className="p-2 rounded-md shadow-md"
      style={{
        backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
        border: isDark ? "none" : "1px solid #9CA3AF",
      }}
    >
      <strong style={{ color: isDark ? "#F9FAFB" : "#111827" }} className="text-sm">
        {label}
      </strong>
      {payload.map((item) => (
        <p key={item.name} style={{ color: isDark ? "#D1D5DB" : "#374151" }} className="text-sm">
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  if (!active || !payload?.length) return null;

  const item = payload[0];
  return (
    <div
      className="p-2 rounded-md shadow-md text-xs"
      style={{
        backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
        border: isDark ? "none" : "1px solid #9CA3AF",
      }}
    >
      <strong style={{ color: isDark ? "#F9FAFB" : "#111827" }}>
        {item.name}: {item.value}
      </strong>
    </div>
  );
};

const StudentsByProdiChart = ({ data, sidebarCollapsed }: StudentsByProdiChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const current = data[0] || { name: "N/A", male: 0, female: 0 };
  const pieData = [
    { name: "Laki-laki", value: current.male },
    { name: "Perempuan", value: current.female },
  ];
  const barData = [{ name: current.name, male: current.male, female: current.female }];

  return (
    <div className="grid grid-cols-2 gap-4 p-6 rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 shadow-md">
      {/* Bar Chart */}
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Statistik Gender: {current.name}
        </h2>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer key={sidebarCollapsed ? "collapsed" : "expanded"} width="100%" height="100%">
            <BarChart layout="vertical" data={barData} margin={{ left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
              <XAxis type="number" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
              <YAxis
                dataKey="name"
                type="category"
                stroke={isDark ? "#9CA3AF" : "#6B7280"}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="male" fill={COLORS_BAR[0]} name="Laki-laki" />
              <Bar dataKey="female" fill={COLORS_BAR[1]} name="Perempuan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Perbandingan Gender</h2>
        <ResponsiveContainer key={sidebarCollapsed ? "collapsed" : "expanded"} width="100%" height="85%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              labelLine={false}
            >
              {pieData.map((_, idx) => (
                <Cell key={idx} fill={COLORS_PIE[idx]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            {/* <Legend
              verticalAlign="middle"
              align="center"
              wrapperStyle={{ color: isDark ? "#E5E7EB" : "#1F2937", fontSize: 14 }}
            /> */}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentsByProdiChart;
