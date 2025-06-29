"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { TooltipProps } from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface StudentsPerSemesterChartProps {
  data: { semester: number; count: number }[];
}

const StudentsPerSemesterChart = ({ data }: StudentsPerSemesterChartProps) => {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  return (
    <div className="p-6 rounded-lg bg-white dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-800 shadow-md h-96">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Jumlah Mahasiswa per Semester
      </h2>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
          <XAxis dataKey="semester" stroke={isDark ? "#9CA3AF" : "#4B5563"} />
          <YAxis stroke={isDark ? "#9CA3AF" : "#4B5563"} />
          <Tooltip content={CustomTooltip} />
          <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 rounded-md shadow-md"
        style={{
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          border: isDark ? "none" : "1px solid #9CA3AF",
          borderRadius: "0.5rem",
        }}
      >
        <p style={{ color: isDark ? "#F9FAFB" : "#111827", fontWeight: 600 }} className="text-sm">
          Semester {label}
        </p>
        <p style={{ color: isDark ? "#D1D5DB" : "#374151" }} className="text-sm">
          Total Mahasiswa: {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
};

export default StudentsPerSemesterChart;
