"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  Calendar,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  Target
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { useDashboard } from '@/hooks/useData';
import { KpiCard } from '@/components/ui/KpiCard';
import { useAuth } from "@/context/AuthContext";
import { Skeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboard();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="mb-10 space-y-4">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
          <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Skeleton className="h-[500px] w-full rounded-3xl" />
            </div>
            <div className="lg:col-span-4 space-y-8">
              <Skeleton className="h-[240px] w-full rounded-3xl" />
              <Skeleton className="h-[240px] w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const chartData = [
    { name: "To Do", value: stats?.tasksByStatus?.todo || 0, color: "#94a3b8" },
    { name: "In Progress", value: stats?.tasksByStatus?.inProgress || 0, color: "#6366f1" },
    { name: "Done", value: stats?.tasksByStatus?.done || 0, color: "#10b981" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Welcome Section */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-extrabold text-[#343a40] tracking-tight">
                Hello, {user?.name?.split(' ')[0]}
              </h1>
              <span className="animate-bounce text-3xl">👋</span>
            </div>
            <p className="text-base text-[#6c757d] font-semibold opacity-80">
              Your workspace is thriving! Here's a quick overview of your team's progress.
            </p>
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-white border border-[#e9ebec] rounded-2xl shadow-xl shadow-primary/5">
            {['daily', 'weekly', 'monthly'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer
                  ${timeRange === range 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-[#adb5bd] hover:text-[#343a40] hover:bg-[#f8f8fb]'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Section */}
        <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={Target} value={stats?.totalTasks || 0} label="Active Tasks" iconColor="primary" />
          <KpiCard icon={CheckCircle2} value={stats?.tasksByStatus?.done || 0} label="Completed" iconColor="success" />
          <KpiCard icon={AlertCircle} value={stats?.overdueTasks || 0} label="Delayed" iconColor="danger" />
          <KpiCard icon={TrendingUp} value={`${stats?.completionRate || 0}%`} label="Overall Velocity" iconColor="warning" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Chart Section */}
          <div className="lg:col-span-8 group">
            <div className="h-full rounded-3xl border border-[#e9ebec] bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
              <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#343a40] tracking-tight">Task Distribution</h3>
                  <p className="text-sm text-[#adb5bd] font-bold mt-1 uppercase tracking-wider">Performance metrics per status</p>
                </div>
                <div className="flex items-center gap-6 p-3 bg-[#f8f8fb] rounded-2xl">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-[10px] font-extrabold text-[#6c757d] uppercase tracking-widest">
                      <div className="h-3 w-3 rounded-md" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      {chartData.map((item, i) => (
                        <linearGradient key={`grad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={item.color} stopOpacity={1} />
                          <stop offset="100%" stopColor={item.color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#eff2f7" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#adb5bd', letterSpacing: 1 }} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#adb5bd' }} 
                    />
                    <Tooltip
                      cursor={{ fill: '#f8f8fb', radius: 15 }}
                      contentStyle={{ 
                        borderRadius: '24px', 
                        border: 'none', 
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', 
                        padding: '20px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                      }}
                      itemStyle={{ fontSize: '13px', fontWeight: '800', color: '#343a40' }}
                    />
                    <Bar dataKey="value" radius={[15, 15, 5, 5]} barSize={80}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#barGrad-${index})`} className="transition-all duration-500 hover:opacity-90" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Sidebar Stats */}
          <div className="lg:col-span-4 space-y-10">
            {/* Team Performance */}
            <div className="rounded-3xl border border-[#e9ebec] bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-extrabold text-[#343a40] tracking-tight">Top Members</h3>
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Users size={20} />
                </div>
              </div>
              
              <div className="space-y-6">
                {stats?.tasksPerUser?.slice(0, 4).map((user: any, idx: number) => (
                  <div key={user.userId} className="group/item flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center text-sm font-black text-white shadow-lg shadow-primary/20 transition-transform group-hover/item:scale-110">
                            {user.userName?.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-success" />
                        </div>
                        <div>
                          <span className="text-sm font-black text-[#343a40] block">{user.userName}</span>
                          <span className="text-[10px] font-extrabold text-[#adb5bd] uppercase tracking-wider">Level {5 - idx} contributor</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-primary block">{Math.round((user.completed / (user.totalAssigned || 1)) * 100)}%</span>
                        <span className="text-[10px] font-extrabold text-[#adb5bd] uppercase tracking-wider">Velocity</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#f8f8fb] overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-info transition-all duration-1000 ease-out"
                        style={{ width: `${user.totalAssigned > 0 ? (user.completed / user.totalAssigned) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                {!stats?.tasksPerUser?.length && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-[#f8f8fb] flex items-center justify-center text-[#adb5bd] mb-4">
                      <Users size={32} opacity={0.3} />
                    </div>
                    <p className="text-sm text-[#adb5bd] font-bold uppercase tracking-wider">No team data yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-3xl border border-[#e9ebec] bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-[#343a40] tracking-tight">Recent Flow</h3>
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <ArrowUpRight size={20} />
                </div>
              </div>
              
              <div className="space-y-5">
                {stats?.recentTasks?.slice(0, 5).map((task: any) => (
                  <div 
                    key={task.id} 
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white hover:bg-[#f8f8fb] transition-all cursor-pointer border border-[#f8f8fb] hover:border-[#e9ebec] group/task shadow-sm hover:shadow-md"
                  >
                    <div className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ring-4 ${
                        task.status === 'DONE' 
                          ? 'bg-success ring-success/10' 
                          : 'bg-primary ring-primary/10'
                      }`} 
                    />
                    <div>
                      <p className="text-sm font-black text-[#343a40] line-clamp-1 group-hover/task:text-primary transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-extrabold text-[#adb5bd] uppercase tracking-widest">
                          {task.assignedTo?.name || 'Unassigned'}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-[#adb5bd]" />
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
                          {new Date(task.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {!stats?.recentTasks?.length && (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                    <BarChart3 size={40} className="mb-3 text-[#adb5bd]" />
                    <p className="text-xs font-black uppercase tracking-widest text-[#adb5bd]">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
