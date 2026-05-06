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
  Loader2,
  User
} from "lucide-react";
import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useData';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';
import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

export default function TasksPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
        toast.success("Task created successfully!");
      },
      onError: () => toast.error("Failed to create task"),
    });
  };

  const handleUpdate = (data: any) => {
    updateMutation.mutate({ id: editingTask.id, data }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setEditingTask(null);
        toast.success("Task updated successfully!");
      },
      onError: () => toast.error("Failed to update task"),
    });
  };

  const handleDelete = () => {
    if (taskToDelete) {
      deleteMutation.mutate(taskToDelete, {
        onSuccess: () => {
          setIsConfirmOpen(false);
          setTaskToDelete(null);
          toast.success("Task deleted successfully!");
        },
        onError: () => toast.error("Failed to delete task"),
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

  const filteredTasks = tasks?.data?.filter((task: any) => {
    if (statusFilter === 'ALL') return true;
    return task.status === statusFilter;
  }) || [];


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
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${isFilterOpen ? 'border-primary bg-primary/5 text-primary' : 'border-[#e9ebec] bg-white text-[#343a40] hover:bg-[#f8f8fb]'}`}
              >
                <Filter size={16} />
                {statusFilter === 'ALL' ? 'Filter' : statusFilter.replace('_', ' ')}
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-[#eff2f7] bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status as any);
                        setIsFilterOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === status ? 'bg-primary/10 text-primary' : 'text-[#6c757d] hover:bg-[#f8f8fb] hover:text-[#343a40]'}`}
                    >
                      {status === 'ALL' && <CheckSquare size={14} />}
                      {status === 'TODO' && <AlertCircle size={14} />}
                      {status === 'IN_PROGRESS' && <Clock size={14} />}
                      {status === 'DONE' && <CheckCircle2 size={14} />}
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isAdmin && (
              <button 
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Plus size={18} />
                New Task
              </button>
            )}
          </div>
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
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === task.id ? null : task.id);
                          }}
                          className="h-8 w-8 rounded-full flex items-center justify-center text-[#adb5bd] hover:bg-[#f8f8fb] hover:text-[#343a40] transition-all cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {activeMenu === task.id && (
                          <div className="absolute right-0 z-10 mt-2 w-32 rounded-lg border border-[#eff2f7] bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                            {isAdmin && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTask(task);
                                  setIsModalOpen(true);
                                  setActiveMenu(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#343a40] hover:bg-[#f8f8fb] hover:text-primary transition-all"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/tasks/${task.id}`);
                                setActiveMenu(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#343a40] hover:bg-[#f8f8fb] hover:text-primary transition-all"
                            >
                              <User size={14} />
                              View
                            </button>
                            {isAdmin && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTaskToDelete(task.id);
                                  setIsConfirmOpen(true);
                                  setActiveMenu(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/5 transition-all"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
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

        {/* Create/Edit Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={editingTask ? 'Edit Task' : 'Create New Task'}
        >
          <TaskForm 
            initialData={editingTask}
            onSubmit={editingTask ? handleUpdate : handleCreate}
            isLoading={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>

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
