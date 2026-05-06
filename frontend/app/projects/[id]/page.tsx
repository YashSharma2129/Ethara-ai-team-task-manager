"use client";
import { AppShell } from "@/components/layout/AppShell";
import {
  FolderKanban, ArrowLeft, Calendar, Users, CheckCircle2, Clock,
  AlertCircle, Plus, Edit, Trash2, Eye, Search, X, Target, Layout, User, UserPlus, Flag,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  SideDrawer, DrawerInput, DrawerSelect, DrawerTextarea,
} from "@/components/ui/SideDrawer";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useProjectDetails, useProjectTasks, useUpdateProject, useDeleteProject,
  useCreateTask, useUpdateTask, useDeleteTask, useUsers,
} from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import api from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_THEMES: Record<string, { cls: string; icon: any; label: string }> = {
  DONE: { cls: "bg-success/10 text-success", icon: CheckCircle2, label: "Done" },
  IN_PROGRESS: { cls: "bg-primary/10 text-primary", icon: Clock, label: "In Progress" },
  TODO: { cls: "bg-[#f1f3f5] text-[#6c757d]", icon: AlertCircle, label: "To Do" },
};

const PRIORITY_THEMES: Record<string, string> = {
  URGENT: "bg-danger/10 text-danger",
  HIGH: "bg-warning/10 text-warning",
  MEDIUM: "bg-primary/10 text-primary",
  LOW: "bg-success/10 text-success",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAdmin, user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { data: project, isLoading: projectLoading } = useProjectDetails(id);
  const { data: tasks, isLoading: tasksLoading } = useProjectTasks(id);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const canManage = isAdmin || project?.adminId === user?.id;

  const addMemberMutation = useMutation({
    mutationFn: async (values: any) => {
      const resp = await api.post(`/projects/${id}/members`, { userId: values.userId });
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setIsMemberDrawerOpen(false);
      toast.success("Member invited successfully");
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Failed to add member"),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const resp = await api.delete(`/projects/${id}/members/${userId}`);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setIsConfirmOpen(false);
      setMemberToRemove(null);
      toast.success("Member removed");
    },
    onError: () => toast.error("Failed to remove member"),
  });

  const filteredTasks = useMemo(() => {
    const q = search.toLowerCase();
    return (tasks?.data ?? []).filter((t: any) => t.title.toLowerCase().includes(q));
  }, [tasks, search]);

  async function handleTaskSubmit(values: any) {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, data: values });
      toast.success("Task updated");
    } else {
      await createMutation.mutateAsync({ ...values, projectId: id });
      toast.success("Task created");
    }
    queryClient.invalidateQueries({ queryKey: ["project-tasks", id] });
    setIsTaskDrawerOpen(false);
    setEditingTask(null);
  }

  async function handleTaskDelete() {
    if (!taskToDelete) return;
    deleteTaskMutation.mutate(taskToDelete, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["project-tasks", id] });
        setTaskToDelete(null);
        setIsDeleteConfirmOpen(false);
        toast.success("Task deleted");
      },
      onError: (e: any) => toast.error(e.response?.data?.message ?? "Delete failed"),
    });
  }

  const { data: usersData, isLoading: usersLoading } = useUsers();
  const allUsers = usersData?.data ?? [];
  const existingMemberIds = new Set(project?.members?.map((m: any) => m.userId) || []);
  const nonMembers = allUsers.filter((u: any) => !existingMemberIds.has(u.id));

  if (projectLoading || tasksLoading || usersLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-8">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Skeleton className="lg:col-span-8 h-96 rounded-3xl" />
            <Skeleton className="lg:col-span-4 h-96 rounded-3xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  const stats = {
    total: tasks?.data?.length || 0,
    done: tasks?.data?.filter((t: any) => t.status === "DONE").length || 0,
    inProgress: tasks?.data?.filter((t: any) => t.status === "IN_PROGRESS").length || 0,
    todo: tasks?.data?.filter((t: any) => t.status === "TODO").length || 0,
  };
  const rate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const members = project?.members || [];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Navigation */}
        <button
          onClick={() => router.push("/projects")}
          className="group mb-8 flex items-center gap-2 text-sm font-bold text-[#adb5bd] transition-colors hover:text-primary"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-[#eff2f7] shadow-sm transition-transform group-hover:-translate-x-1">
            <ArrowLeft size={16} />
          </div>
          Back to Projects
        </button>

        {/* ─── Hero Header Card ─── */}
        <div className="mb-8 rounded-[32px] border border-[#eff2f7] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                <FolderKanban size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight text-[#343a40]">
                    {project.name}
                  </h1>
                  <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary">
                    {project.status || "ACTIVE"}
                  </span>
                </div>
                <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[#6c757d]">
                  {project.description || "Project strategy and team collaboration."}
                </p>
                <div className="mt-3 flex items-center gap-4 text-[11px] font-bold text-[#adb5bd]">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    Started {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-[#dee2e6]" />
                  <div className="flex items-center gap-1.5">
                    <Users size={12} />
                    {members.length} member{members.length !== 1 ? "s" : ""}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-[#dee2e6]" />
                  <div className="flex items-center gap-1.5">
                    <Target size={12} />
                    {stats.total} task{stats.total !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMemberDrawerOpen(true)}
                  className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white active:scale-95 cursor-pointer"
                >
                  <UserPlus size={16} />
                  Invite Member
                </button>
                <button
                  onClick={() => { setEditingTask(null); setIsTaskDrawerOpen(true); }}
                  className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
                >
                  <Plus size={16} />
                  New Task
                </button>
              </div>
            )}
          </div>

          {/* ─── Inline Stats Bar ─── */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#f1f3f5] pt-6 sm:grid-cols-4">
            {[
              { label: "To Do", value: stats.todo, color: "text-[#6c757d]", bg: "bg-[#f1f3f5]" },
              { label: "In Progress", value: stats.inProgress, color: "text-primary", bg: "bg-primary/10" },
              { label: "Completed", value: stats.done, color: "text-success", bg: "bg-success/10" },
              { label: "Completion", value: `${rate}%`, color: "text-[#343a40]", bg: "bg-[#f8f9fa]" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-3 rounded-2xl ${s.bg} px-4 py-3`}>
                <span className={`text-xl font-extrabold ${s.color}`}>{s.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#adb5bd]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Main Content: 2-column layout ─── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* ─── LEFT: Tasks Section (8 cols) ─── */}
          <div className="lg:col-span-8">
            <div className="rounded-[28px] border border-[#eff2f7] bg-white shadow-sm overflow-hidden">
              {/* Tasks Header */}
              <div className="flex items-center justify-between border-b border-[#f1f3f5] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CheckCircle2 size={16} />
                  </div>
                  <h2 className="text-[14px] font-extrabold text-[#343a40]">Tasks</h2>
                  <span className="rounded-lg bg-[#f1f3f5] px-2 py-0.5 text-[10px] font-extrabold text-[#6c757d]">
                    {stats.total}
                  </span>
                </div>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#adb5bd]" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-40 rounded-xl border border-[#eff2f7] bg-[#f8f9fa] pl-8 pr-3 text-[11px] outline-none transition-all focus:border-primary/40 focus:bg-white"
                  />
                </div>
              </div>

              {/* Task List */}
              <div className="divide-y divide-[#f8f9fa]">
                {filteredTasks.map((t: any) => {
                  const st = STATUS_THEMES[t.status] || STATUS_THEMES.TODO;
                  return (
                    <div
                      key={t.id}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#fafbfc] cursor-pointer"
                      onClick={() => router.push(`/tasks/${t.id}`)}
                    >
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${st.cls}`}>
                        <st.icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-extrabold text-[#343a40] group-hover:text-primary transition-colors">
                          {t.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-3 text-[10px] font-bold text-[#adb5bd]">
                          {t.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User size={10} />
                              {t.assignedTo.name}
                            </span>
                          )}
                          {t.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {fmt(t.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`rounded-lg px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${PRIORITY_THEMES[t.priority]}`}>
                        {t.priority}
                      </span>
                      {canManage && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingTask(t); setIsTaskDrawerOpen(true); }}
                            className="rounded-lg p-1.5 text-[#adb5bd] hover:bg-[#f1f3f5] hover:text-[#343a40]"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setTaskToDelete(t.id); setIsDeleteConfirmOpen(true); }}
                            className="rounded-lg p-1.5 text-[#adb5bd] hover:bg-danger/10 hover:text-danger"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f3f5] text-[#adb5bd]">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-sm font-bold text-[#343a40]">
                    {search ? "No tasks match your search" : "No tasks yet"}
                  </p>
                  <p className="mt-1 text-[12px] text-[#adb5bd]">
                    {search ? "Try a different keyword" : "Create your first task to get started"}
                  </p>
                  {!search && canManage && (
                    <button
                      onClick={() => { setEditingTask(null); setIsTaskDrawerOpen(true); }}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[12px] font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                    >
                      <Plus size={14} />
                      Create Task
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Team Sidebar (4 cols) ─── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Team Members Card */}
            <div className="rounded-[28px] border border-[#eff2f7] bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#f1f3f5] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                    <Users size={16} />
                  </div>
                  <h2 className="text-[14px] font-extrabold text-[#343a40]">Team</h2>
                  <span className="rounded-lg bg-[#f1f3f5] px-2 py-0.5 text-[10px] font-extrabold text-[#6c757d]">
                    {members.length}
                  </span>
                </div>
                {canManage && (
                  <button
                    onClick={() => setIsMemberDrawerOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 text-primary transition-all hover:bg-primary hover:text-white cursor-pointer"
                    title="Invite Member"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#f8f9fa]">
                {members.map((m: any) => (
                  <div key={m.id} className="group flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[#fafbfc]">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-[11px] font-extrabold text-primary">
                      {initials(m.user?.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-[#343a40]">{m.user?.name}</p>
                      <p className="truncate text-[10px] text-[#adb5bd]">{m.user?.email}</p>
                    </div>
                    {m.userId === project.adminId ? (
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-primary">
                        Owner
                      </span>
                    ) : (
                      canManage && (
                        <button
                          onClick={() => { setMemberToRemove(m); setIsConfirmOpen(true); }}
                          className="rounded-lg p-1.5 text-[#adb5bd] opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                          title="Remove Member"
                        >
                          <X size={13} />
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>

              {/* Invite CTA */}
              {canManage && nonMembers.length > 0 && (
                <div className="border-t border-[#f1f3f5] p-4">
                  <button
                    onClick={() => setIsMemberDrawerOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#dee2e6] py-3 text-[12px] font-bold text-[#adb5bd] transition-all hover:border-primary/40 hover:text-primary cursor-pointer"
                  >
                    <UserPlus size={14} />
                    Invite a team member
                  </button>
                </div>
              )}
            </div>

            {/* Quick Info Card */}
            <div className="rounded-[28px] border border-[#eff2f7] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-[#adb5bd]">
                Project Info
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Status", value: project.status || "ACTIVE", icon: Layout },
                  { label: "Created", value: new Date(project.createdAt).toLocaleDateString(), icon: Calendar },
                  { label: "Owner", value: members.find((m: any) => m.userId === project.adminId)?.user?.name || "—", icon: User },
                  { label: "Tasks", value: `${stats.done}/${stats.total} completed`, icon: Target },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f8f9fa] text-[#adb5bd]">
                      <item.icon size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#adb5bd]">{item.label}</p>
                      <p className="text-[13px] font-bold text-[#343a40]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Drawers & Modals ─── */}
        <SideDrawer
          isOpen={isMemberDrawerOpen}
          onClose={() => setIsMemberDrawerOpen(false)}
          title="Invite Member"
          subtitle="Add a new collaborator to the project."
          formKey="invite-member"
          onSubmit={addMemberMutation.mutateAsync}
        >
          <DrawerSelect
            name="userId"
            label="Select User"
            placeholder="Search for a user..."
            isRequired
            options={nonMembers.map((u: any) => ({ label: `${u.name} (${u.email})`, value: u.id }))}
          />
        </SideDrawer>

        <TaskDrawer
          isOpen={isTaskDrawerOpen}
          onClose={() => { setIsTaskDrawerOpen(false); setEditingTask(null); }}
          editingTask={editingTask}
          fixedProjectId={id}
          onSubmit={handleTaskSubmit}
        />

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => removeMemberMutation.mutate(memberToRemove.userId)}
          title="Remove Member"
          message={`Are you sure you want to remove ${memberToRemove?.user?.name}?`}
          isLoading={removeMemberMutation.isPending}
        />

        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => { setIsDeleteConfirmOpen(false); setTaskToDelete(null); }}
          onConfirm={handleTaskDelete}
          title="Delete Task"
          message="This task will be permanently removed. This action cannot be undone."
          isLoading={deleteTaskMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
