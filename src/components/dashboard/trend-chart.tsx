'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Generate deterministic chart data
function generateTrendData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const seed = date.getDate() * 31 + date.getMonth() * 12;
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      critical: Math.floor(((Math.sin(seed * 0.1) + 1) * 2) + 1),
      high: Math.floor(((Math.sin(seed * 0.2) + 1) * 5) + 3),
      medium: Math.floor(((Math.sin(seed * 0.3) + 1) * 10) + 8),
      low: Math.floor(((Math.sin(seed * 0.15) + 1) * 8) + 5),
    });
  }
  return data;
}

const RISK_DISTRIBUTION = [
  { name: 'Critical', value: 5, color: 'hsl(0, 72%, 51%)' },
  { name: 'High', value: 15, color: 'hsl(25, 95%, 53%)' },
  { name: 'Medium', value: 50, color: 'hsl(45, 93%, 47%)' },
  { name: 'Low', value: 30, color: 'hsl(142, 71%, 45%)' },
];

export function TrendChart() {
  const [range, setRange] = useState<'7' | '14' | '30'>('7');
  const data = useMemo(() => generateTrendData(Number(range)), [range]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Alert Volume Trends</CardTitle>
            <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
              <TabsList className="h-7">
                <TabsTrigger value="7" className="text-xs h-5 px-2">7d</TabsTrigger>
                <TabsTrigger value="14" className="text-xs h-5 px-2">14d</TabsTrigger>
                <TabsTrigger value="30" className="text-xs h-5 px-2">30d</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.3} />
              <Area type="monotone" dataKey="high" stackId="1" stroke="hsl(25, 95%, 53%)" fill="hsl(25, 95%, 53%)" fillOpacity={0.3} />
              <Area type="monotone" dataKey="medium" stackId="1" stroke="hsl(45, 93%, 47%)" fill="hsl(45, 93%, 47%)" fillOpacity={0.2} />
              <Area type="monotone" dataKey="low" stackId="1" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={RISK_DISTRIBUTION} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                {RISK_DISTRIBUTION.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {RISK_DISTRIBUTION.map(item => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                {item.name} ({item.value}%)
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
