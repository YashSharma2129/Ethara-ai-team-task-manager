"use client";

import { AppShell } from "@/components/layout/AppShell";
import { 
  CheckSquare, 
  Plus, 
  Filter, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Flag,
  Edit,
  Trash2,
  User
} from "lucide-react";
import { useState } from 'react';
import { SideDrawer, DrawerInput, DrawerSelect, DrawerTextarea, DrawerToggle } from '@/components/ui/SideDrawer';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useProjects } from '@/hooks/useData';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';
import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function TasksPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [projectIdFilter, setProjectIdFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: tasks, isLoading: tasksLoading } = useTasks({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    projectId: projectIdFilter || undefined,
  });
  
  const { data: projects } = useProjects();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter tasks locally for search
  const filteredTasks = tasks?.data?.filter((t: any) => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (tasksLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="bg-white rounded-2xl border border-[#e9ebec] shadow-sm overflow-hidden">
             <div className="bg-[#f8f8fb] h-12 w-full border-b border-[#e9ebec]" />
             {[1,2,3,4,5].map(i => <TableRowSkeleton key={i} />)}
          </div>
        </div>
      </AppShell>
    );
  }

  const handleDrawerSubmit = async (values: any) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, data: values });
      toast.success("Task updated successfully!");
    } else {
      await createMutation.mutateAsync(values);
      toast.success("Task created successfully!");
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = () => {
    if (taskToDelete) {
      deleteMutation.mutate(taskToDelete, {
        onSuccess: () => {
          setIsConfirmOpen(false);
          setTaskToDelete(null);
          toast.success("Task deleted successfully!");
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || "Failed to delete task";
          toast.error(message);
          setIsConfirmOpen(false);
          setTaskToDelete(null);
        },
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-danger bg-danger/10';
      case 'HIGH': return 'text-warning bg-warning/10';
      case 'MEDIUM': return 'text-primary bg-primary/10';
      default: return 'text-success bg-success/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE': return <CheckCircle2 size={16} className="text-success" />;
      case 'IN_PROGRESS': return <Clock size={16} className="text-primary" />;
      default: return <AlertCircle size={16} className="text-muted" />;
    }
  };




  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#343a40]">My Tasks</h1>
            <p className="text-sm text-[#6c757d]">Keep track of your assigned work and deadlines</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-[#e9ebec] bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
            {isAdmin && (
              <button 
                onClick={() => {
                  setEditingTask(null);
                  setIsDrawerOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus size={18} />
                New Task
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-[#e9ebec] bg-white p-1.5 shadow-sm">
            <button 
              onClick={() => setStatusFilter('')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === '' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[#6c757d] hover:bg-[#f8f8fb]'}`}
            >
              All
            </button>
            <button 
              onClick={() => setStatusFilter('TODO')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'TODO' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[#6c757d] hover:bg-[#f8f8fb]'}`}
            >
              To Do
            </button>
            <button 
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'IN_PROGRESS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[#6c757d] hover:bg-[#f8f8fb]'}`}
            >
              In Progress
            </button>
            <button 
              onClick={() => setStatusFilter('DONE')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'DONE' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[#6c757d] hover:bg-[#f8f8fb]'}`}
            >
              Completed
            </button>
          </div>

          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-[#e9ebec] bg-white px-4 py-2.5 text-xs font-bold text-[#343a40] outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
          >
            <option value="">Any Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select 
            value={projectIdFilter}
            onChange={(e) => setProjectIdFilter(e.target.value)}
            className="rounded-xl border border-[#e9ebec] bg-white px-4 py-2.5 text-xs font-bold text-[#343a40] outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer max-w-[200px]"
          >
            <option value="">All Projects</option>
            {projects?.data?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Task List Table */}
        <div className="rounded-2xl border border-[#e9ebec] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#e9ebec] bg-[#f8f8fb] text-[#6c757d]">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Task Name</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Project</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Priority</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Due Date</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9ebec]">
                {filteredTasks.map((task: any) => (
                  <tr 
                    key={task.id} 
                    onClick={() => router.push(`/tasks/${task.id}`)}
                    className="hover:bg-[#f8f8fb]/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#f8f8fb] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <CheckSquare size={16} />
                        </div>
                        <span className="font-semibold text-[#343a40] group-hover:text-primary transition-colors">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#f8f8fb] text-[#6c757d] text-xs font-bold">
                        {task.project?.name || "No Project"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-[#343a40]">
                        {getStatusIcon(task.status)}
                        <span className="capitalize">{task.status.replace('_', ' ').toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${getPriorityColor(task.priority)}`}>
                        <Flag size={10} />
                        {task.priority}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#6c757d] font-medium">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
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
                          <User size={14} />
                          View
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            if (!isAdmin) return;
                            e.stopPropagation();
                            setEditingTask(task);
                            setIsDrawerOpen(true);
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
                            setIsConfirmOpen(true);
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
          </div>
          {filteredTasks.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f8fb] text-[#adb5bd] mb-4">
                <CheckSquare size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#343a40]">No tasks found</h3>
              <p className="text-sm text-[#6c757d]">You're all caught up! Enjoy your day.</p>
            </div>
          )}
        </div>

        {/* Create/Edit SideDrawer */}
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setEditingTask(null);
          }}
          title={editingTask ? 'Edit Task' : 'Create New Task'}
          subtitle={editingTask ? `Updating ${editingTask.title}` : 'Fill in the details to create a new task.'}
          formKey={editingTask ? `edit-${editingTask.id}` : 'create-task'}
          onSubmit={handleDrawerSubmit}
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
              name="projectId" 
              label="Project" 
              isRequired
              defaultValue={editingTask?.projectId}
              options={projects?.data?.map((p: any) => ({ label: p.name, value: p.id })) || []}
            />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DrawerSelect 
              name="status" 
              label="Status" 
              defaultValue={editingTask?.status || 'TODO'}
              options={[
                { label: 'To Do', value: 'TODO' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Done', value: 'DONE' },
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
