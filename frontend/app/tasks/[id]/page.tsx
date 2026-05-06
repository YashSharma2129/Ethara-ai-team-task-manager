"use client";
import { AppShell } from "@/components/layout/AppShell";
import {
  ArrowLeft,
  Calendar,
  Flag,
  Clock,
  Edit,
  Trash2,
  MessageSquare,
  ChevronRight,
  Target,
  User,
  History,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useDeleteTask, useUpdateTask } from "@/hooks/useData";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { useQueryClient } from "@tanstack/react-query";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_THEMES: Record<string, { cls: string; icon: any }> = {
  URGENT: { cls: "bg-danger/10 text-danger border-danger/20", icon: Flag },
  HIGH: { cls: "bg-warning/10 text-warning border-warning/20", icon: Flag },
  MEDIUM: { cls: "bg-primary/10 text-primary border-primary/20", icon: Flag },
  LOW: { cls: "bg-success/10 text-success border-success/20", icon: Flag },
};

const STATUS_THEMES: Record<string, { cls: string; label: string }> = {
  DONE: { cls: "bg-success text-white", label: "Completed" },
  IN_PROGRESS: { cls: "bg-primary text-white", label: "In Progress" },
  TODO: { cls: "bg-[#f1f3f5] text-[#6c757d]", label: "To Do" },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAdmin, user } = useAuth();
  const deleteMutation = useDeleteTask();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const updateMutation = useUpdateTask();

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const resp = await api.get(`/tasks/${id}`);
      return resp.data;
    },
    enabled: !!id,
  });

  async function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Task deleted");
        router.push("/tasks");
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.message ?? "Delete failed");
      },
    });
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1100px] px-4 py-8">
          <Skeleton className="mb-6 h-6 w-24 rounded-lg" />
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 space-y-6">
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
            <div className="w-full lg:w-80">
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const pTheme = PRIORITY_THEMES[task?.priority] || PRIORITY_THEMES.MEDIUM;
  const sTheme = STATUS_THEMES[task?.status] || STATUS_THEMES.TODO;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-sm font-bold text-[#adb5bd] transition-colors hover:text-primary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-[#eff2f7] shadow-sm transition-transform group-hover:-translate-x-1">
              <ArrowLeft size={16} />
            </div>
            Back
          </button>

          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#adb5bd]">
            <span className="hover:text-[#343a40] cursor-default transition-colors">Tasks</span>
            <ChevronRight size={12} />
            <span className="text-[#343a40]">Details</span>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ── Left Column ── */}
          <div className="flex-1 space-y-6">
            <div className="rounded-3xl border border-[#eff2f7] bg-white p-8 shadow-sm">
              {/* Header Info */}
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider ${pTheme.cls}`}>
                    <pTheme.icon size={13} />
                    {task.priority} Priority
                  </span>
                  <span className={`inline-flex items-center rounded-xl px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider ${sTheme.cls}`}>
                    {sTheme.label}
                  </span>
                </div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#adb5bd]">
                  Ref: <span className="text-[#343a40]">{task.id.slice(0, 8)}</span>
                </div>
              </div>

              {/* Title & Desc */}
              <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-[#343a40]">
                {task.title}
              </h1>
              <p className="mb-10 text-[15px] leading-relaxed text-[#6c757d]">
                {task.description || "No description provided."}
              </p>

              {/* Sub-sections */}
              <div className="space-y-10">
                {/* Activity */}
                <div className="pt-8 border-t border-[#f1f3f5]">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[#343a40]">
                      <History size={16} className="text-primary" />
                      Activity Timeline
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {[
                      { type: "CREATED", label: "Task was created", date: task.createdAt, user: "System" },
                      task.assignedTo && { type: "ASSIGNED", label: `Assigned to ${task.assignedTo.name}`, date: task.createdAt, user: "Admin" },
                    ].filter(Boolean).map((act: any, i) => (
                      <div key={i} className="relative flex gap-4">
                        {i !== 1 && (
                          <div className="absolute left-[7px] top-6 h-10 w-0.5 bg-[#f1f3f5]" />
                        )}
                        <div className="z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white bg-primary shadow-sm" />
                        <div>
                          <p className="text-[13px] font-bold text-[#343a40]">{act.label}</p>
                          <p className="mt-1 text-[11px] font-semibold text-[#adb5bd]">
                            {fmt(act.date)} • {act.user}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments Placeholder */}
                <div className="pt-8 border-t border-[#f1f3f5]">
                  <h3 className="mb-6 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[#343a40]">
                    <MessageSquare size={16} className="text-primary" />
                    Discussion
                  </h3>
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-[#f8f9fa] py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#adb5bd] shadow-sm">
                      <MessageSquare size={20} />
                    </div>
                    <p className="text-[13px] font-bold text-[#343a40]">No comments yet</p>
                    <p className="mt-1 text-[11px] text-[#adb5bd]">Collaborate with your team members here.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="w-full space-y-6 lg:w-80">
            {/* Meta Info */}
            <div className="rounded-3xl border border-[#eff2f7] bg-white p-6 shadow-sm">
              <h4 className="mb-6 text-[11px] font-extrabold uppercase tracking-widest text-[#adb5bd]">
                Properties
              </h4>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#6c757d]">
                    <Target size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#adb5bd]">Project</p>
                    <p 
                      onClick={() => router.push(`/projects/${task.project?.id}`)}
                      className="mt-0.5 cursor-pointer text-[13px] font-extrabold text-primary hover:underline"
                    >
                      {task.project?.name || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#6c757d]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#adb5bd]">Due Date</p>
                    <p className="mt-0.5 text-[13px] font-extrabold text-[#343a40]">
                      {task.dueDate ? fmt(task.dueDate) : "No deadline"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-[#f1f3f5]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[14px] font-extrabold text-primary">
                    {task.assignedTo?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#adb5bd]">Assignee</p>
                    <p className="mt-0.5 text-[13px] font-extrabold text-[#343a40]">
                      {task.assignedTo?.name || "Unassigned"}
                    </p>
                    <p className="text-[11px] font-semibold text-[#adb5bd]">Team Member</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {(isAdmin || task.project?.adminId === user?.id) && (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#eff2f7] bg-white py-3.5 text-sm font-bold text-[#343a40] shadow-sm transition-all hover:bg-[#f8f9fa] active:scale-95"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button 
                  onClick={() => setIsConfirmOpen(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-danger/5 py-3.5 text-sm font-bold text-danger transition-all hover:bg-danger hover:text-white active:scale-95"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Drawer */}
        <TaskDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          editingTask={task}
          onSubmit={async (values) => {
            await updateMutation.mutateAsync({ id, data: values });
            queryClient.invalidateQueries({ queryKey: ["task", id] });
            toast.success("Task updated");
            setIsDrawerOpen(false);
          }}
          formKeyPrefix="task-details"
        />

        {/* Delete Confirm */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          isLoading={deleteMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
