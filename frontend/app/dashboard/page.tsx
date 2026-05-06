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
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Skeleton className="h-[450px] w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-[200px] w-full rounded-2xl" />
              <Skeleton className="h-[200px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const chartData = [
    { name: "To Do", value: stats?.tasksByStatus?.todo || 0, color: "#adb5bd" },
    { name: "In Progress", value: stats?.tasksByStatus?.inProgress || 0, color: "#6366f1" },
    { name: "Done", value: stats?.tasksByStatus?.done || 0, color: "#22c55e" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px]">
        {/* Welcome Section */}
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#343a40] tracking-tight">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-sm text-[#6c757d] font-medium mt-1">Here's what's happening across your workspace today.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-[#e9ebec]">
            <button
              onClick={() => setTimeRange('daily')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${timeRange === 'daily' ? 'bg-[#f8f8fb] text-primary' : 'text-[#6c757d] hover:text-[#343a40]'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${timeRange === 'weekly' ? 'bg-[#f8f8fb] text-primary' : 'text-[#6c757d] hover:text-[#343a40]'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${timeRange === 'monthly' ? 'bg-[#f8f8fb] text-primary' : 'text-[#6c757d] hover:text-[#343a40]'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* KPI Section */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={Target} value={stats?.totalTasks || 0} label="Total Tasks" iconColor="primary" />
          <KpiCard icon={CheckCircle2} value={stats?.tasksByStatus?.done || 0} label="Completed" iconColor="success" />
          <KpiCard icon={AlertCircle} value={stats?.overdueTasks || 0} label="Overdue" iconColor="danger" />
          <KpiCard icon={TrendingUp} value={`${stats?.completionRate || 0}%`} label="Completion Rate" iconColor="warning" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Chart */}
          <div className="lg:col-span-8 rounded-2xl border border-[#e9ebec] bg-white p-6 shadow-sm transition-all hover:shadow-md group">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#343a40]">Task Distribution</h3>
                <p className="text-xs text-[#adb5bd] font-medium">Visual breakdown of your current workload</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-[#6c757d] uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#adb5bd]" /> To Do</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> In Progress</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-success" /> Done</div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f8fb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#adb5bd' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#adb5bd' }} />
                  <Tooltip
                    cursor={{ fill: '#f8f8fb', radius: 10 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', padding: '16px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="transition-all duration-500 hover:opacity-80" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity/User Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="rounded-2xl border border-[#e9ebec] bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-[#343a40]">Team Performance</h3>
              <div className="space-y-5">
                {stats?.tasksPerUser?.map((user: any) => (
                  <div key={user.userId} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {user.userName?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-[#343a40]">{user.userName}</span>
                      </div>
                      <span className="text-xs font-bold text-[#6c757d]">{user.completed}/{user.totalAssigned} Tasks</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#f8f8fb] overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${user.totalAssigned > 0 ? (user.completed / user.totalAssigned) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                {!stats?.tasksPerUser?.length && (
                  <p className="text-center py-10 text-sm text-[#adb5bd] font-medium">No team data available yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#e9ebec] bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#343a40]">Recent Tasks</h3>
                <ArrowUpRight size={18} className="text-[#adb5bd]" />
              </div>
              <div className="space-y-4">
                {stats?.recentTasks?.map((task: any) => (
                  <div key={task.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#f8f8fb] transition-all cursor-pointer border border-transparent hover:border-[#e9ebec]">
                    <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${task.status === 'DONE' ? 'bg-success' : 'bg-primary'
                      }`} />
                    <div>
                      <p className="text-sm font-bold text-[#343a40] line-clamp-1">{task.title}</p>
                      <p className="text-[10px] font-bold text-[#adb5bd] uppercase mt-0.5">{task.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                ))}
                {!stats?.recentTasks?.length && (
                  <p className="text-center py-6 text-sm text-[#adb5bd] font-medium">No recent tasks.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
