"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProjectFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function ProjectForm({ initialData, onSubmit, isLoading, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-[#343a40] mb-1.5">Project Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-[#e9ebec] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          placeholder="e.g., Marketing Campaign"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#343a40] mb-1.5">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full h-32 rounded-lg border border-[#e9ebec] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
          placeholder="Describe the project goals and scope..."
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
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (initialData ? 'Update Project' : 'Create Project')}
        </button>
      </div>
    </form>
  );
}
