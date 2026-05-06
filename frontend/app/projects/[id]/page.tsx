"use client";

import { AppShell } from "@/components/layout/AppShell";
import { 
  FolderKanban, 
  ArrowLeft, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  User as UserIcon
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { SideDrawer, DrawerInput, DrawerSelect, DrawerTextarea } from "@/components/ui/SideDrawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTasks, useCreateTask, useProjects, useProjectDetails, useProjectTasks, useUpdateTask, useDeleteTask } from "@/hooks/useData";
import { KpiCard } from "@/components/ui/KpiCard";
import { useAuth } from "@/context/AuthContext";
import { Skeleton, CardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import api from "@/lib/api";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAdmin, user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'tasks' | 'members'>('tasks');
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string, name: string } | null>(null);

  const { data: project, isLoading: projectLoading } = useProjectDetails(id);
  const { data: tasks, isLoading: tasksLoading } = useProjectTasks(id);
  const { data: projects } = useProjects();
  
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isTaskConfirmOpen, setIsTaskConfirmOpen] = useState(false);

  const addMemberMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await api.post(`/projects/${id}/members`, { email: values.email, role: 'MEMBER' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsMemberDrawerOpen(false);
      toast.success("Member added successfully");
    },
    onError: () => toast.error("Failed to add member")
  });

  const handleTaskSubmit = async (values: any) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, data: values });
      toast.success("Task updated successfully");
    } else {
      await createMutation.mutateAsync({ ...values, projectId: id });
      toast.success("Task created successfully");
    }
    queryClient.invalidateQueries({ queryKey: ['project-tasks', id] });
    setIsTaskDrawerOpen(false);
    setEditingTask(null);
  };

  const handleTaskDelete = async () => {
    if (taskToDelete) {
      deleteMutation.mutate(taskToDelete, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['project-tasks', id] });
          setIsTaskConfirmOpen(false);
          setTaskToDelete(null);
          toast.success("Task deleted successfully");
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || "Failed to delete task";
          toast.error(message);
          setIsTaskConfirmOpen(false);
          setTaskToDelete(null);
        }
      });
    }
  };

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/projects/${id}/members/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsConfirmOpen(false);
      setMemberToRemove(null);
      toast.success("Member removed successfully");
    },
    onError: () => toast.error("Failed to remove member")
  });

  if (projectLoading || tasksLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1400px]">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="flex gap-6 mb-8">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="space-y-2 flex-1">
               <Skeleton className="h-8 w-1/3" />
               <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="bg-white rounded-2xl border border-[#e9ebec] shadow-sm overflow-hidden">
             <div className="h-16 w-full border-b border-[#e9ebec] px-6 flex items-center gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
             </div>
             {[1,2,3,4,5].map(i => <TableRowSkeleton key={i} />)}
          </div>
        </div>
      </AppShell>
    );
  }

  const taskStats = {
    total: tasks?.data?.length || 0,
    done: tasks?.data?.filter((t: any) => t.status === 'DONE').length || 0,
    todo: tasks?.data?.filter((t: any) => t.status === 'TODO').length || 0,
    inProgress: tasks?.data?.filter((t: any) => t.status === 'IN_PROGRESS').length || 0,
  };

  const completionRate = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px]">
        {/* Breadcrumbs / Back */}
        <button 
          onClick={() => router.back()}
          className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-bold text-[#6c757d] hover:text-primary transition-all"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        {/* Project Header */}
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <FolderKanban size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#343a40] tracking-tight mb-2">{project?.name}</h1>
              <p className="max-w-2xl text-sm text-[#6c757d] leading-relaxed">
                {project?.description || "No description provided for this project."}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <button 
                onClick={() => setIsTaskDrawerOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Plus size={18} />
                Add Task
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={FolderKanban} value={taskStats.total} label="Total Tasks" iconColor="primary" />
          <KpiCard icon={CheckCircle2} value={taskStats.done} label="Completed" iconColor="success" />
          <KpiCard icon={Clock} value={taskStats.inProgress} label="In Progress" iconColor="info" />
          <div className="flex items-center gap-4 rounded-xl border border-[#e9ebec] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
              <span className="text-xs font-bold">{completionRate}%</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#343a40]">{completionRate}%</p>
              <p className="text-sm font-medium text-[#6c757d]">Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Tasks/Members Toggle */}
        <div className="rounded-2xl border border-[#e9ebec] bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#eff2f7] flex items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`text-lg font-bold transition-all cursor-pointer ${activeTab === 'tasks' ? 'text-primary' : 'text-[#adb5bd] hover:text-[#343a40]'}`}
              >
                Project Tasks
              </button>
              <button 
                onClick={() => setActiveTab('members')}
                className={`text-lg font-bold transition-all cursor-pointer ${activeTab === 'members' ? 'text-primary' : 'text-[#adb5bd] hover:text-[#343a40]'}`}
              >
                Team Members
              </button>
            </div>
            {activeTab === 'members' && isAdmin && (
              <button 
                onClick={() => setIsMemberDrawerOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Plus size={14} />
                Add Member
              </button>
            )}
          </div>

          {activeTab === 'tasks' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8f8fb] text-[#6c757d]">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Task Name</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Assignee</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Priority</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Due Date</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff2f7]">
                  {tasks?.data?.map((task: any) => (
                    <tr key={task.id} className="hover:bg-[#f8f8fb]/50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#343a40] group-hover:text-primary transition-colors">{task.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {task.assignedTo?.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-[#6c757d] font-medium">{task.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          task.status === 'DONE' ? 'bg-success/10 text-success' : 
                          task.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-[#6c757d]'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === 'URGENT' ? 'bg-danger/10 text-danger' : 
                          task.priority === 'HIGH' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#adb5bd] font-medium">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/tasks/${task.id}`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all"
                          >
                            <UserIcon size={14} />
                            View
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              if (!isAdmin) return;
                              e.stopPropagation();
                              setEditingTask(task);
                              setIsTaskDrawerOpen(true);
                            }}
                            disabled={!isAdmin}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all
                              ${isAdmin 
                                ? 'text-[#343a40] bg-[#f8f8fb] hover:bg-primary hover:text-white cursor-pointer' 
                                : 'text-[#adb5bd] bg-[#f8f8fb] cursor-not-allowed opacity-60'}`}
                            title={!isAdmin ? "Only admins can edit tasks" : ""}
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button 
                            onClick={(e) => {
                              if (!isAdmin) return;
                              e.stopPropagation();
                              setTaskToDelete(task.id);
                              setIsTaskConfirmOpen(true);
                            }}
                            disabled={!isAdmin}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all
                              ${isAdmin 
                                ? 'text-danger bg-danger/5 hover:bg-danger hover:text-white cursor-pointer' 
                                : 'text-[#adb5bd] bg-[#f8f8fb] cursor-not-allowed opacity-60'}`}
                            title={!isAdmin ? "Only admins can delete tasks" : ""}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!tasks?.data?.length && (
                <div className="p-12 text-center text-[#adb5bd]">
                  <AlertCircle size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No tasks found for this project yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project?.members?.map((member: any) => (
                  <div key={member.id} className="group flex items-center justify-between rounded-xl border border-[#e9ebec] p-4 bg-[#f8f8fb]/50 transition-all hover:bg-white hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#343a40]">{member.name}</p>
                        <p className="text-[10px] text-[#6c757d] font-medium">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${member.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-[#e9ebec] text-[#6c757d]'}`}>
                        {member.role}
                      </span>
                      {isAdmin && member.id !== user?.id && (
                        <button 
                          onClick={() => {
                            setMemberToRemove({ id: member.id, name: member.name });
                            setIsConfirmOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-danger bg-danger/5 hover:bg-danger hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove Member"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Member SideDrawer */}
        <SideDrawer
          isOpen={isMemberDrawerOpen}
          onClose={() => setIsMemberDrawerOpen(false)}
          title="Invite Team Member"
          subtitle="Add a new member to the project by their email address."
          formKey="add-member"
          onSubmit={async (values) => {
            await addMemberMutation.mutateAsync(values);
          }}
          submitLabel="Send Invitation"
        >
          <DrawerInput 
            name="email" 
            label="Member Email" 
            type="email" 
            placeholder="colleague@company.com" 
            isRequired 
          />
        </SideDrawer>

        {/* Create Task SideDrawer */}
        <SideDrawer
          isOpen={isTaskDrawerOpen}
          onClose={() => {
            setIsTaskDrawerOpen(false);
            setEditingTask(null);
          }}
          title={editingTask ? 'Edit Task' : 'Create New Task'}
          subtitle={editingTask ? `Updating ${editingTask.title}` : 'Add a new task to this project.'}
          formKey={editingTask ? `edit-task-${editingTask.id}` : 'create-project-task'}
          onSubmit={handleTaskSubmit}
          submitLabel={editingTask ? 'Update Task' : 'Create Task'}
        >
          <DrawerInput 
            name="title" 
            label="Task Title" 
            placeholder="e.g., Design homepage mockup" 
            isRequired 
            defaultValue={editingTask?.title}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <DrawerSelect 
              name="priority" 
              label="Priority" 
              defaultValue={editingTask?.priority || 'MEDIUM'}
              options={[
                { label: 'Low', value: 'LOW' },
                { label: 'Medium', value: 'MEDIUM' },
                { label: 'High', value: 'HIGH' },
                { label: 'Urgent', value: 'URGENT' },
              ]}
            />
            <DrawerInput 
              name="dueDate" 
              label="Due Date" 
              type="date"
              defaultValue={editingTask?.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
            />
          </div>

          <DrawerTextarea 
            name="description" 
            label="Description" 
            placeholder="What needs to be done?" 
            defaultValue={editingTask?.description}
          />
        </SideDrawer>

        <ConfirmModal
          isOpen={isTaskConfirmOpen}
          onClose={() => setIsTaskConfirmOpen(false)}
          onConfirm={handleTaskDelete}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          isLoading={deleteMutation.isPending}
        />

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => memberToRemove && removeMemberMutation.mutate(memberToRemove.id)}
          title="Remove Member"
          message={`Are you sure you want to remove ${memberToRemove?.name} from this project? they will lose access to all tasks.`}
          isLoading={removeMemberMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
