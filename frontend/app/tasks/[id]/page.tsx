"use client";

import { AppShell } from "@/components/layout/AppShell";
import { 
  CheckSquare, 
  ArrowLeft, 
  Calendar, 
  Flag, 
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  Loader2,
  User,
  MessageSquare
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAdmin } = useAuth();

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1000px]">
          <Skeleton className="h-6 w-24 mb-6" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
            <div className="w-full lg:w-80 space-y-6">
              <Skeleton className="h-[300px] w-full rounded-2xl" />
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 flex-1 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-danger bg-danger/10 border-danger/20';
      case 'HIGH': return 'text-warning bg-warning/10 border-warning/20';
      case 'MEDIUM': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-success bg-success/10 border-success/20';
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1000px]">
        {/* Back link */}
        <button 
          onClick={() => router.back()}
          className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-bold text-[#6c757d] hover:text-primary transition-all"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="rounded-2xl border border-[#e9ebec] bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task?.priority)}`}>
                  <Flag size={14} />
                  {task?.priority} Priority
                </span>
                <span className="text-xs font-bold text-[#adb5bd] uppercase tracking-wider">
                  ID: #{task?.id?.slice(0, 8)}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-[#343a40] mb-4">{task?.title}</h1>
              <p className="text-[#6c757d] leading-relaxed mb-8">
                {task?.description || "No description provided for this task."}
              </p>

            <div className="pt-8 border-t border-[#f8f8fb]">
                <h3 className="text-sm font-bold text-[#343a40] mb-4 flex items-center gap-2">
                  <Clock size={16} />
                  Activity History
                </h3>
                <div className="space-y-4">
                  {[
                    { type: 'STATUS_CHANGE', from: 'TODO', to: task?.status, user: task?.assignedTo?.name, date: task?.createdAt },
                    { type: 'ASSIGNED', user: 'Admin', to: task?.assignedTo?.name, date: task?.createdAt }
                  ].map((activity, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-xl bg-[#f8f8fb]/50 border border-[#e9ebec]">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-xs font-medium text-[#343a40]">
                          {activity.type === 'STATUS_CHANGE' ? (
                            <>Status changed to <span className="font-bold text-primary">{activity.to?.replace('_', ' ')}</span></>
                          ) : (
                            <>Assigned to <span className="font-bold text-primary">{activity.to}</span></>
                          )}
                        </p>
                        <p className="text-[10px] text-[#adb5bd] font-bold mt-1">
                          {new Date(activity.date).toLocaleString()} • By {activity.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-[#f8f8fb]">
                <h3 className="text-sm font-bold text-[#343a40] mb-4 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Comments (0)
                </h3>
                <div className="rounded-xl border border-[#e9ebec] bg-[#f8f8fb]/50 p-4 text-center">
                  <p className="text-xs text-[#adb5bd] font-medium">No comments yet. Be the first to chime in!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="rounded-2xl border border-[#e9ebec] bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#343a40] mb-4 uppercase tracking-wider">Details</h3>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#adb5bd]">Status</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    task?.status === 'DONE' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                  }`}>
                    {task?.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#adb5bd]">Project</span>
                  <span className="text-xs font-bold text-primary hover:underline cursor-pointer">
                    {task?.project?.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#adb5bd]">Due Date</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#343a40]">
                    <Calendar size={14} className="text-[#adb5bd]" />
                    {task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f8f8fb]">
                  <span className="text-[10px] font-bold text-[#adb5bd] uppercase block mb-3">Assignee</span>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {task?.assignedTo?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#343a40]">{task?.assignedTo?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-[#adb5bd] font-medium">Team Member</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#f8f8fb] border border-[#e9ebec] py-2.5 text-sm font-bold text-[#343a40] hover:bg-[#eff2f7] transition-all cursor-pointer">
                  <Edit size={16} />
                  Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-danger/5 border border-danger/10 py-2.5 text-sm font-bold text-danger hover:bg-danger/10 transition-all cursor-pointer">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
