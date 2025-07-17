"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

// Mock data - in a real app, this would come from MongoDB
const data = [
  {
    name: "Jan",
    total: 120,
  },
  {
    name: "Feb",
    total: 132,
  },
  {
    name: "Mar",
    total: 101,
  },
  {
    name: "Apr",
    total: 134,
  },
  {
    name: "May",
    total: 190,
  },
  {
    name: "Jun",
    total: 230,
  },
  {
    name: "Jul",
    total: 210,
  },
  {
    name: "Aug",
    total: 220,
  },
  {
    name: "Sep",
    total: 215,
  },
  {
    name: "Oct",
    total: 250,
  },
  {
    name: "Nov",
    total: 290,
  },
  {
    name: "Dec",
    total: 310,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
