"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { LayoutGrid } from 'lucide-react';

interface ContractStatusDataPoint {
  status: string;
  count: number;
  fill: string;
}

interface ContractStatusOverviewChartProps {
  data: ContractStatusDataPoint[];
  config: ChartConfig;
}

const ContractStatusOverviewChartComponent: React.FC<ContractStatusOverviewChartProps> = ({ data, config }) => {
  return (
    <Card className="shadow-lg border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <LayoutGrid className="mr-2 h-5 w-5 text-primary" />
          Contract Status Overview
        </CardTitle>
        <CardDescription>Distribution of contracts across different statuses.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] sm:h-[350px] pt-4">
        <ChartContainer config={config} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export const ContractStatusOverviewChart = React.memo(ContractStatusOverviewChartComponent);
