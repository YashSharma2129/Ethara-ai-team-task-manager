"use client";

import { AppShell } from "@/components/layout/AppShell";
import { 
  FolderKanban, 
  Plus, 
  MoreVertical, 
  Calendar,
  Search,
  Trash2,
  Edit,
  Loader2
} from "lucide-react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SideDrawer, DrawerInput, DrawerSelect, DrawerTextarea } from '@/components/ui/SideDrawer';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Skeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleDrawerSubmit = async (values: any) => {
    if (editingProject) {
      await updateMutation.mutateAsync({ id: editingProject.id, data: values });
      toast.success("Project updated successfully");
    } else {
      await createMutation.mutateAsync(values);
      toast.success("Project created successfully");
    }
    setIsDrawerOpen(false);
    setEditingProject(null);
  };

  const handleDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete, {
        onSuccess: () => {
          setIsConfirmOpen(false);
          setProjectToDelete(null);
          toast.success("Project deleted successfully");
        },
      });
    }
  };

  if (projectsLoading) {
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
             {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#343a40]">Projects</h1>
            <p className="text-sm text-[#6c757d]">Manage and track all your team projects</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#adb5bd]" size={16} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-10 pr-4 py-2 rounded-lg border border-[#e9ebec] bg-white text-sm w-64 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            {isAdmin && (
              <button 
                onClick={() => {
                  setEditingProject(null);
                  setIsDrawerOpen(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Plus size={18} />
                New Project
              </button>
            )}
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects?.data?.map((project: any) => (
            <div key={project.id} className="group relative rounded-2xl border border-[#e9ebec] bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:scale-110">
                  <FolderKanban size={24} />
                </div>
                
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                        setIsDrawerOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-[#343a40] bg-[#f8f8fb] hover:bg-primary hover:text-white transition-all cursor-pointer"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project.id);
                        setIsConfirmOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-danger bg-danger/5 hover:bg-danger hover:text-white transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div 
                onClick={() => router.push(`/projects/${project.id}`)}
                className="mb-6 cursor-pointer"
              >
                <h3 className="text-lg font-bold text-[#343a40] mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
                <p className="text-sm text-[#6c757d] line-clamp-2 leading-relaxed">
                  {project.description || "No description provided for this project."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#f8f8fb]">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-[#e9ebec] flex items-center justify-center text-[10px] font-bold text-[#6c757d]">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[#6c757d] text-xs font-medium">
                  <Calendar size={14} />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit SideDrawer */}
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setEditingProject(null);
          }}
          title={editingProject ? 'Edit Project' : 'New Project'}
          subtitle={editingProject ? `Updating ${editingProject.name}` : 'Define the project scope and key details.'}
          formKey={editingProject ? `edit-${editingProject.id}` : 'create-project'}
          onSubmit={handleDrawerSubmit}
          submitLabel={editingProject ? 'Update Project' : 'Create Project'}
        >
          <DrawerInput 
            name="name" 
            label="Project Name" 
            placeholder="e.g., Marketing Campaign 2024" 
            isRequired 
            defaultValue={editingProject?.name}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <DrawerSelect 
              name="status" 
              label="Initial Status" 
              defaultValue={editingProject?.status || 'ACTIVE'}
              options={[
                { label: 'Active', value: 'ACTIVE' },
                { label: 'On Hold', value: 'ON_HOLD' },
                { label: 'Completed', value: 'COMPLETED' },
              ]}
            />
            <DrawerInput 
              name="dueDate" 
              label="End Date" 
              type="date"
              defaultValue={editingProject?.dueDate ? new Date(editingProject.dueDate).toISOString().split('T')[0] : ''}
            />
          </div>

          <DrawerTextarea 
            name="description" 
            label="Project Vision" 
            placeholder="Describe the goals and objectives of this project..." 
            defaultValue={editingProject?.description}
          />
        </SideDrawer>

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action will permanently remove all associated tasks and data."
          isLoading={deleteMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
