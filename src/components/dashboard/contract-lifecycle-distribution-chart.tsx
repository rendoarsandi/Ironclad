"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { PieChart as RechartsPieChart, Pie, ResponsiveContainer, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface LifecycleStageDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface ContractLifecycleDistributionChartProps {
  data: LifecycleStageDataPoint[];
  config: ChartConfig;
}

const ContractLifecycleDistributionChartComponent: React.FC<ContractLifecycleDistributionChartProps> = ({ data, config }) => {
  return (
    <Card className="shadow-lg border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChartIcon className="mr-2 h-5 w-5 text-primary" />
          Contract Lifecycle Distribution
        </CardTitle>
        <CardDescription>Contracts by their current lifecycle stage.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] sm:h-[350px] pt-4">
        <ChartContainer config={config} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <RechartsTooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export const ContractLifecycleDistributionChart = React.memo(ContractLifecycleDistributionChartComponent);
