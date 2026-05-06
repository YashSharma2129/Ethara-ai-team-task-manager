"use client";

import { AppShell } from "@/components/layout/AppShell";
import { 
  Share2, 
  Edit3, 
  ChevronDown, 
  Loader2,
  Mail,
  Camera,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useUpdateProfile } from "@/hooks/useData";
import { Skeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { ChangePassword } from "@/components/profile/ChangePassword";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const updateProfile = useUpdateProfile();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Local state for form fields to remove hardcoding
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    department: "Engineering",
    title: "Software Engineer",
    yearsOfExperience: "5",
    location: "",
    linkedin: "",
    gender: "Male"
  });

  useEffect(() => {
    if (user) {
      const names = user.name?.split(" ") || ["", ""];
      setFormData(prev => ({
        ...prev,
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        bio: user.bio || "",
        location: user.location || "",
        department: user.department || prev.department,
        title: user.title || prev.title,
        yearsOfExperience: user.yearsOfExperience || prev.yearsOfExperience,
      }));
    }
  }, [user]);

  const handleSave = () => {
    updateProfile.mutate({
      name: `${formData.firstName} ${formData.lastName}`,
      bio: formData.bio,
      location: formData.location,
      department: formData.department,
      title: formData.title,
      yearsOfExperience: formData.yearsOfExperience
    }, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: () => {
        toast.error("Failed to update profile");
      }
    });
  };

  if (loading) {
    return (
      <AppShell>
         <div className="mx-auto max-w-[1300px] px-4 py-8">
            <div className="flex flex-col gap-8">
               <Skeleton className="h-40 w-full rounded-2xl" />
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-3">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                  </div>
                  <div className="lg:col-span-9">
                    <Skeleton className="h-96 w-full rounded-2xl" />
                  </div>
               </div>
            </div>
         </div>
      </AppShell>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Change Password' },
    { id: 'delete', label: 'Delete Account' },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1300px] px-4 py-4">
        {/* Top Centered Tabs */}
        <div className="mb-6 flex justify-center border-b border-[#eff2f7]">
          <div className="flex overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-4 text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id 
                    ? 'text-primary' 
                    : 'text-[#6c757d] hover:text-[#343a40]'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'profile' && (
            <>
              {/* Breadcrumb Section */}
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-sm font-bold text-[#343a40] uppercase tracking-wider">PROFILE</h1>
                <div className="text-[11px] font-bold text-[#adb5bd]">
                  <span className="hover:text-primary cursor-pointer transition-colors">Workspace</span>
                  <span className="mx-2 text-[#eff2f7]">/</span>
                  <span className="text-[#343a40]">Profile</span>
                </div>
              </div>

              {/* User Header Card */}
              <div className="mb-8 overflow-hidden rounded-xl border border-[#eff2f7] bg-white shadow-sm">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative group">
                        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#eff2f7] bg-[#f8f8fb] shadow-sm transition-transform hover:scale-105">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=1a3353&color=fff&size=128`} 
                            alt="Profile" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#eff2f7] bg-white text-[#6c757d] shadow-sm hover:text-primary transition-all">
                          <Camera size={14} />
                        </button>
                      </div>
                      <div className="text-center md:text-left">
                        <h2 className="text-xl font-bold text-[#343a40]">{user?.name}</h2>
                        <div className="mt-1 flex items-center justify-center md:justify-start gap-2 text-[#6c757d]">
                          <Mail size={14} className="text-[#adb5bd]" />
                          <span className="text-sm font-medium">{user?.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="mb-6 text-base font-bold text-[#343a40]">User Profile</h3>

              {/* Form Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar - Bio & LinkedIn */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="rounded-xl border border-[#eff2f7] bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#343a40]">Bio/ About <span className="text-danger">*</span></h4>
                      <Edit3 size={14} className="text-[#adb5bd] cursor-pointer hover:text-primary" />
                    </div>
                    <textarea 
                      className="w-full min-h-[220px] rounded-lg border-none bg-transparent p-0 text-sm leading-relaxed text-[#6c757d] outline-none placeholder:text-[#adb5bd] resize-none"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="mt-6 pt-6 border-t border-[#f8f8fb]">
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#adb5bd]">Linkedin Profile URL</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className="w-full rounded-lg border border-[#eff2f7] bg-[#f8f8fb]/50 px-4 py-2.5 text-xs font-medium outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
                          placeholder="https://www.linkedin.com/in/..."
                          value={formData.linkedin}
                          onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Info Form Grid */}
                <div className="lg:col-span-9">
                  <div className="rounded-xl border border-[#eff2f7] bg-white p-8 shadow-sm">
                    <div className="mb-8 flex items-center justify-between">
                      <h4 className="text-lg font-bold text-[#343a40]">Profile Information</h4>
                      <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-[#f8f8fb] text-[#adb5bd] hover:text-primary transition-all border border-[#eff2f7]">
                        <Edit3 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {/* Row 1 */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#343a40] ml-1">First Name <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="w-full rounded-xl border border-[#eff2f7] bg-[#f8f8fb]/50 px-4 py-3 text-sm font-medium outline-none focus:border-primary/30 transition-all"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#343a40] ml-1">Last Name <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="w-full rounded-xl border border-[#eff2f7] bg-[#f8f8fb]/50 px-4 py-3 text-sm font-medium outline-none focus:border-primary/30 transition-all"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>

                      {/* Row 2 */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#343a40] ml-1">Department <span className="text-danger">*</span></label>
                        <div className="relative">
                          <select 
                            className="w-full appearance-none rounded-xl border border-[#eff2f7] bg-[#f8f8fb]/50 px-4 py-3 text-sm font-medium text-[#6c757d] outline-none focus:border-primary/30 transition-all cursor-pointer"
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                          >
                            <option>Engineering</option>
                            <option>Product</option>
                            <option>Design</option>
                            <option>Marketing</option>
                            <option>Sales</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#adb5bd] pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#343a40] ml-1">Current Title <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="w-full rounded-xl border border-[#eff2f7] bg-[#f8f8fb]/50 px-4 py-3 text-sm font-medium outline-none focus:border-primary/30 transition-all"
                          placeholder="e.g. Software Engineer"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                      </div>

                      {/* Row 3 */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#343a40] ml-1">Years of Experience <span className="text-danger">*</span></label>
                        <input 
                          type="number" 
                          className="w-full rounded-xl border border-[#eff2f7] bg-[#f8f8fb]/50 px-4 py-3 text-sm font-medium outline-none focus:border-primary/30 transition-all"
                          value={formData.yearsOfExperience}
                          onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#343a40] ml-1">Gender <span className="text-danger">*</span></label>
                        <div className="relative">
                          <select 
                            className="w-full appearance-none rounded-xl border border-[#eff2f7] bg-[#f8f8fb]/50 px-4 py-3 text-sm font-medium text-[#343a40] outline-none focus:border-primary/30 transition-all cursor-pointer"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#adb5bd] pointer-events-none" />
                        </div>
                      </div>

                      {/* Full Width Row */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-[#343a40] ml-1">Location <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="w-full rounded-xl border border-[#eff2f7] bg-[#f8f8fb]/50 px-4 py-3 text-sm font-medium outline-none focus:border-primary/30 transition-all"
                          placeholder="City, Country"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="mt-12 flex justify-end border-t border-[#f8f8fb] pt-8">
                      <button 
                        onClick={handleSave}
                        disabled={updateProfile.isPending}
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-10 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-95 cursor-pointer disabled:opacity-70"
                      >
                        {updateProfile.isPending && <Loader2 size={16} className="animate-spin" />}
                        {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'password' && <ChangePassword />}

          {activeTab === 'delete' && (
            <div className="mx-auto max-w-2xl py-12 text-center">
               <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 text-danger">
                  <X size={40} />
               </div>
               <h3 className="text-2xl font-bold text-[#343a40] mb-2">Delete Your Account</h3>
               <p className="text-[#6c757d] mb-8">Once you delete your account, there is no going back. Please be certain.</p>
               <button className="rounded-xl bg-danger px-8 py-3 text-sm font-bold text-white shadow-lg shadow-danger/20 hover:bg-danger/90 transition-all">
                  Deactivate Account
               </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

// Re-add the icon since it's used in the code above
function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0077b5">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}
