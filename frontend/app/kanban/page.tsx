"use client";

import { AppShell } from "@/components/layout/AppShell";
import { 
  LayoutDashboard, 
  Plus, 
  MoreVertical, 
  Clock, 
  Flag,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { useTasks, useUpdateTask, useCreateTask, useProjects, useDeleteTask } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { Skeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { SideDrawer, DrawerInput, DrawerSelect, DrawerTextarea } from "@/components/ui/SideDrawer";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useRouter } from "next/navigation";

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-primary/5' },
  { id: 'DONE', title: 'Completed', color: 'bg-success/5' },
];

export default function KanbanPage() {
  const { isAdmin } = useAuth();
  const { data: tasks, isLoading } = useTasks();
  const { data: projects } = useProjects();
  const updateMutation = useUpdateTask();
  const createMutation = useCreateTask();
  const deleteMutation = useDeleteTask();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks?.data?.find((t: any) => t.id === draggableId);
    if (task) {
      updateMutation.mutate({ 
        id: draggableId, 
        data: { ...task, status: destination.droppableId } 
      }, {
        onSuccess: () => toast.success("Task status updated"),
        onError: () => toast.error("Failed to update status")
      });
    }
  };

  const handleDrawerSubmit = async (values: any) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, data: values });
      toast.success("Task updated successfully");
    } else {
      await createMutation.mutateAsync(values);
      toast.success("Task created successfully");
    }
    setIsDrawerOpen(false);
    setEditingTask(null);
  };

  const handleDelete = async () => {
    if (taskToDelete) {
      await deleteMutation.mutateAsync(taskToDelete);
      setIsConfirmOpen(false);
      setTaskToDelete(null);
      toast.success("Task deleted successfully");
    }
  };

  if (isLoading || !mounted) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex gap-6 overflow-x-hidden">
             {[1,2,3].map(i => (
                <div key={i} className="w-[350px] space-y-4">
                   <Skeleton className="h-12 w-full rounded-2xl" />
                   <CardSkeleton />
                   <CardSkeleton />
                   <CardSkeleton />
                </div>
             ))}
          </div>
        </div>
      </AppShell>
    );
  }

  const tasksByStatus = (status: string) => tasks?.data?.filter((t: any) => t.status === status) || [];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1600px] h-full flex flex-col">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#343a40] tracking-tight">Kanban Board</h1>
            <p className="text-sm text-[#6c757d] font-medium mt-1">Visualize and manage your team workflow.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus size={18} />
              New Task
            </button>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-1 gap-6 overflow-x-auto pb-4 no-scrollbar min-h-[70vh]">
            {COLUMNS.map((column) => (
              <div key={column.id} className="flex flex-col w-[350px] min-w-[350px] rounded-2xl bg-[#f4f5f7]/50 border border-[#e9ebec]">
                <div className="p-4 flex items-center justify-between border-b border-[#e9ebec] bg-white rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      column.id === 'DONE' ? 'bg-success' : column.id === 'IN_PROGRESS' ? 'bg-primary' : 'bg-[#adb5bd]'
                    }`} />
                    <h3 className="text-sm font-bold text-[#343a40] uppercase tracking-wider">{column.title}</h3>
                    <span className="rounded-full bg-[#f8f8fb] px-2 py-0.5 text-[10px] font-bold text-[#6c757d]">
                      {tasksByStatus(column.id).length}
                    </span>
                  </div>
                  <MoreVertical size={16} className="text-[#adb5bd]" />
                </div>

                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="p-4 flex-1 space-y-4"
                    >
                      {tasksByStatus(column.id).map((task: any, index: number) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="group rounded-xl border border-[#e9ebec] bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  task.priority === 'URGENT' ? 'bg-danger/10 text-danger' : 
                                  task.priority === 'HIGH' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                                }`}>
                                  {task.priority}
                                </span>
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {task.assignedTo?.name?.charAt(0) || 'U'}
                                </div>
                              </div>
                              <h4 className="text-sm font-bold text-[#343a40] group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                {task.title}
                              </h4>
                              
                              <p className="text-[11px] text-[#6c757d] line-clamp-2 leading-relaxed mb-4">
                                {task.description}
                              </p>

                              {/* Hover Actions */}
                              <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 backdrop-blur-sm">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/tasks/${task.id}`);
                                  }}
                                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                  title="View"
                                >
                                  <Eye size={16} />
                                </button>
                                {isAdmin && (
                                  <>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingTask(task);
                                        setIsDrawerOpen(true);
                                      }}
                                      className="p-2 rounded-lg bg-[#f8f8fb] text-[#343a40] hover:bg-primary hover:text-white transition-all shadow-sm"
                                      title="Edit"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTaskToDelete(task.id);
                                        setIsConfirmOpen(true);
                                      }}
                                      className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all shadow-sm"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-[#f8f8fb]">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#adb5bd]">
                                  <Clock size={12} />
                                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
                                </div>
                                <div className="flex -space-x-2">
                                  {/* Just a decorative avatar stack */}
                                  <div className="h-5 w-5 rounded-full border border-white bg-gray-200" />
                                  <div className="h-5 w-5 rounded-full border border-white bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                                    +1
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Create SideDrawer */}
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setEditingTask(null);
          }}
          title={editingTask ? 'Edit Task' : 'Create New Task'}
          subtitle={editingTask ? `Updating ${editingTask.title}` : 'Add a new task to your team workflow.'}
          formKey={editingTask ? `edit-kanban-task-${editingTask.id}` : 'kanban-create-task'}
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
