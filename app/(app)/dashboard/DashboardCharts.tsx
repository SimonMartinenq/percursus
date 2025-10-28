"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardChartsProps {
  weeklyData: { name: string; value: number }[];
  dailyData: { date: string; count: number }[];
  statusData: { todo: number; inProgress: number; done: number; total: number };
  performance: { onTimeRate: number; averageDurationDays: number };
}

export function DashboardCharts({
  weeklyData,
  dailyData,
  performance,
}: DashboardChartsProps) {
  return (
    <div className="space-y-4">
      {/* Weekly completions */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Complétions par semaine</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité (14 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span>Taux de complétion à temps</span>
              <span className="font-medium">{performance.onTimeRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Durée moyenne des modules</span>
              <span className="font-medium">
                {performance.averageDurationDays} jours
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
