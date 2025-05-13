
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon, BarChart3, AlertTriangle, TrendingUp, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <PieChartIcon className="mr-3 h-8 w-8 text-primary" /> Advanced Analytics
          </h1>
          <p className="text-muted-foreground">
            Dive deep into your contract data with comprehensive analytics and visualizations.
          </p>
        </div>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Contract Performance Insights</CardTitle>
          <CardDescription>
            Understand trends, identify bottlenecks, and optimize your contract management processes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                  Lifecycle Velocity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track average time spent in each stage of the contract lifecycle. Identify areas for improvement.
                </p>
                <Button variant="outline" disabled>View Details (Coming Soon)</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                  Value & Volume Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze contract value and volume over time, by department, or by counterparty.
                </p>
                <Button variant="outline" disabled>Explore Trends (Coming Soon)</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Risk & Compliance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get a consolidated view of contract risks, upcoming expirations, and compliance status.
                </p>
                <Button variant="outline" disabled>Assess Risks (Coming Soon)</Button>
              </CardContent>
            </Card>
          </div>
          <div className="text-center p-8 bg-muted/50 rounded-lg">
            <PieChartIcon className="mx-auto h-16 w-16 text-primary opacity-50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Deeper Insights Are Coming Soon!</h3>
            <p className="text-muted-foreground">
              This section will soon feature interactive charts, customizable dashboards, and detailed reporting capabilities.
              We are working on providing you with powerful tools to understand and optimize your contract portfolio.
            </p>
            <Link href="/dashboard" passHref className="mt-4 inline-block">
                <Button variant="link">Back to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
