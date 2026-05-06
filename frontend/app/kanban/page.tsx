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
  CheckCircle2
} from "lucide-react";
import { useTasks, useUpdateTask, useCreateTask } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import { Skeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Modal } from "@/components/ui/Modal";
import { TaskForm } from "@/components/tasks/TaskForm";

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-primary/5' },
  { id: 'DONE', title: 'Completed', color: 'bg-success/5' },
];

export default function KanbanPage() {
  const { isAdmin } = useAuth();
  const { data: tasks, isLoading } = useTasks();
  const updateMutation = useUpdateTask();
  const createMutation = useCreateTask();
  const [mounted, setMounted] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

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

  const handleCreateTask = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsNewTaskOpen(false);
        toast.success("Task created successfully");
      },
      onError: () => toast.error("Failed to create task")
    });
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
              onClick={() => setIsNewTaskOpen(true)}
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

        <Modal 
          isOpen={isNewTaskOpen} 
          onClose={() => setIsNewTaskOpen(false)} 
          title="Create New Task"
        >
          <TaskForm 
            onSubmit={handleCreateTask}
            isLoading={createMutation.isPending}
            onCancel={() => setIsNewTaskOpen(false)}
          />
        </Modal>
      </div>
    </AppShell>
  );
}
