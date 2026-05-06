"use client";

import { useState, useEffect } from 'react';
import { Loader2, Calendar as CalendarIcon, Flag, Tag } from 'lucide-react';
import { useProjects } from '@/hooks/useData';

interface TaskFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function TaskForm({ initialData, onSubmit, isLoading, onCancel }: TaskFormProps) {
  const { data: projects } = useProjects();
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: '',
    assignedToId: '',
    dueDate: '',
  });

  // Fetch project members when projectId changes
  useEffect(() => {
    if (formData.projectId) {
      const selectedProject = projects?.data?.find((p: any) => p.id === formData.projectId);
      if (selectedProject?.members) {
        setProjectMembers(selectedProject.members);
      } else {
        // If members aren't in the list, we might need to fetch them
        // For simplicity here, we assume the projects list includes members or we fallback
        setProjectMembers([]);
      }
    } else {
      setProjectMembers([]);
    }
  }, [formData.projectId, projects]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'TODO',
        priority: initialData.priority || 'MEDIUM',
        projectId: initialData.projectId || '',
        assignedToId: initialData.assignedToId || '',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-[#343a40] mb-1.5">Task Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-lg border border-[#e9ebec] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          placeholder="e.g., Design homepage mockup"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#343a40] mb-1.5">Project</label>
          <select
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            className="w-full rounded-lg border border-[#e9ebec] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            required
          >
            <option value="">Select Project</option>
            {projects?.data?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#343a40] mb-1.5">Assigned To</label>
          <select
            value={formData.assignedToId}
            onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
            className="w-full rounded-lg border border-[#e9ebec] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            disabled={!formData.projectId}
          >
            <option value="">Unassigned</option>
            {projectMembers.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#343a40] mb-1.5">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full rounded-lg border border-[#e9ebec] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#343a40] mb-1.5">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full rounded-lg border border-[#e9ebec] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#343a40] mb-1.5">Due Date</label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="w-full rounded-lg border border-[#e9ebec] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#343a40] mb-1.5">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full h-24 rounded-lg border border-[#e9ebec] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
          placeholder="What needs to be done?"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eff2f7]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-bold text-[#6c757d] hover:text-[#343a40] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (initialData ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
}
