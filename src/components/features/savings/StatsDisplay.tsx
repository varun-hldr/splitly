
'use client';

import React, { useMemo } from 'react';
import type { SerializableContributionStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Landmark, Users, TrendingUp, Target, PiggyBank, BarChart as BarChartIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface StatsDisplayProps {
  stats: SerializableContributionStats;
  tripGoal?: number;
}

const chartConfig = {
  total: {
    label: "Contribution",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export const StatsDisplay = React.memo(function StatsDisplay({ stats, tripGoal }: StatsDisplayProps) {
  const progressPercentage = useMemo(() => {
    return tripGoal && stats.totalAmount > 0 && tripGoal > 0
    ? Math.min((stats.totalAmount / tripGoal) * 100, 100)
    : 0;
  }, [stats.totalAmount, tripGoal]);

  return (
    <>
    {stats.tripName && (
        <h2 className="text-2xl font-semibold mb-6 text-center text-primary">
            Stats for: {stats.tripName}
        </h2>
    )}
    {typeof tripGoal === 'number' && tripGoal > 0 && (
        <Card className="mb-6 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trip Goal Progress</CardTitle>
            <Target className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-1">
              ₹{stats.totalAmount.toLocaleString()} / ₹{tripGoal.toLocaleString()}
            </div>
            <Progress value={progressPercentage} className="w-full h-3 mb-1" />
            <p className="text-xs text-muted-foreground">
              {progressPercentage.toFixed(1)}% towards the goal of ₹{tripGoal.toLocaleString()}.
            </p>
          </CardContent>
        </Card>
      )}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          <Landmark className="h-5 w-5 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            ₹{stats.totalAmount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Sum of all approved contributions for this trip.
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contributors</CardTitle>
          <Users className="h-5 w-5 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {stats.contributionsByUser.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Unique members who contributed to this trip.
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-lg md:col-span-2 lg:col-span-1">
         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Contributor</CardTitle>
          <TrendingUp className="h-5 w-5 text-accent" />
        </CardHeader>
        <CardContent>
          {stats.contributionsByUser.length > 0 ? (
            <>
              <div className="text-2xl font-bold text-primary">
                {stats.contributionsByUser[0].username}
              </div>
              <p className="text-lg text-muted-foreground">
                with ₹{stats.contributionsByUser[0].total.toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No contributions yet for this trip.</p>
          )}
        </CardContent>
      </Card>
      
      {stats.contributionsByUser.length > 0 && (
        <Card className="md:col-span-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-primary" />
              Individual Contributions for {stats.tripName || 'this Trip'}
            </CardTitle>
             <CardDescription>Visual representation of contributions by each member.</CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart
                accessibilityLayer
                data={stats.contributionsByUser}
                layout="horizontal" // For vertical bars, categories on X-axis
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }} 
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="username"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval="auto"
                  tickMargin={4}
                />
                <YAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  width={60}
                />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
       {stats.contributionsByUser.length === 0 && !tripGoal && (
         <Card className="md:col-span-full shadow-lg">
            <CardContent className="pt-6">
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                    <PiggyBank className="h-12 w-12 mb-3" />
                    <p className="text-lg font-medium">No contributions yet for {stats.tripName || 'this trip'}.</p>
                    <p>Be the first one to contribute!</p>
                </div>
            </CardContent>
         </Card>
       )}
    </div>
    </>
  );
});
StatsDisplay.displayName = 'StatsDisplay';
