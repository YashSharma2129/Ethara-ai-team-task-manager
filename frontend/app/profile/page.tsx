"use client";
import { AppShell } from "@/components/layout/AppShell";
import {
  Edit3,
  ChevronDown,
  Loader2,
  Mail,
  Camera,
  X,
  MapPin,
  Briefcase,
  Clock,
  Link2,
  ShieldAlert,
  User,
  Lock,
  AlertTriangle,
  ChevronRight,
  Globe,
  FolderKanban,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useUpdateProfile } from "@/hooks/useData";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { ChangePassword } from "@/components/profile/ChangePassword";


type Tab = "profile" | "password" | "delete";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "profile", label: "Identity", icon: User },
  { id: "password", label: "Security", icon: Lock },
  { id: "delete", label: "Danger Zone", icon: ShieldAlert },
];

const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations", "Finance", "HR"];

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#adb5bd]">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-[#eff2f7] bg-[#f8f9fa] px-4 py-3 text-[13px] font-bold text-[#343a40] outline-none transition-all placeholder:text-[#adb5bd] focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5";

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const updateProfile = useUpdateProfile();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    department: "Engineering",
    title: "",
    yearsOfExperience: "",
    location: "",
    linkedin: "",
    gender: "Male",
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (user) {
      const parts = (user.name ?? "").split(" ");
      setFormData({
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
        department: user.department ?? "Engineering",
        title: user.title ?? "",
        yearsOfExperience: String(user.yearsOfExperience ?? ""),
        linkedin: user.linkedin ?? "",
        gender: user.gender ?? "Male",
      });
      setIsDirty(false);
    }
  }, [user]);

  function set<K extends keyof typeof formData>(key: K, val: string) {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
  }

  const handleSave = () => {
    updateProfile.mutate(
      {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        bio: formData.bio,
        location: formData.location,
        department: formData.department,
        title: formData.title,
        yearsOfExperience: formData.yearsOfExperience,
        linkedin: formData.linkedin,
        gender: formData.gender,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated");
          setIsDirty(false);
        },
        onError: () => toast.error("Update failed"),
      }
    );
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1000px] px-6 py-10 space-y-8">
           <Skeleton className="h-10 w-48 rounded-xl" />
           <Skeleton className="h-32 w-full rounded-3xl" />
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <Skeleton className="h-96 rounded-3xl" />
             <Skeleton className="lg:col-span-2 h-96 rounded-3xl" />
           </div>
        </div>
      </AppShell>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? "U")}&background=1a3353&color=fff&size=200`;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1000px] px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#343a40]">Preferences</h1>
            <p className="mt-1 text-sm font-medium text-[#6c757d]">Adjust your personal identity and security settings.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-10 flex overflow-x-auto no-scrollbar gap-1 rounded-2xl bg-[#f1f3f5]/50 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex flex-shrink-0 sm:flex-1 items-center justify-center gap-2 rounded-xl px-4 sm:px-0 py-3 text-[12px] font-extrabold uppercase tracking-widest transition-all cursor-pointer
                ${
                  activeTab === id
                    ? "bg-white text-primary shadow-sm"
                    : "text-[#adb5bd] hover:text-[#343a40]"
                }
              `}
            >
              <Icon size={14} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Identity Card */}
            <div className="flex flex-col sm:flex-row items-center gap-8 rounded-[32px] border border-[#eff2f7] bg-white p-8 shadow-sm">
              <div className="relative group">
                <div className="h-24 w-24 overflow-hidden rounded-3xl border-4 border-white shadow-xl">
                  <img src={avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                </div>
                <button className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-2xl bg-[#343a40] text-white shadow-lg transition-transform hover:scale-110">
                  <Camera size={14} />
                </button>
              </div>

              <div className="text-center sm:text-left flex-1">
                <span className="inline-block rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  {user?.role || "Team Member"}
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-[#343a40]">{user?.name}</h2>
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start items-center gap-4 text-[13px] font-bold text-[#6c757d]">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-[#adb5bd]" />
                    {user?.email}
                  </div>
                  {formData.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#adb5bd]" />
                      {formData.location}
                    </div>
                  )}
                  {formData.title && (
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-[#adb5bd]" />
                      {formData.title}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Bio & Links */}
              <div className="space-y-8">
                <div className="rounded-[32px] border border-[#eff2f7] bg-white p-6 shadow-sm">
                  <h4 className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-[#adb5bd]">Bio</h4>
                  <textarea
                    className="w-full min-h-[160px] resize-none rounded-2xl bg-[#f8f9fa] p-4 text-[13px] font-bold leading-relaxed text-[#343a40] outline-none transition-all focus:bg-white focus:ring-4 focus:ring-primary/5"
                    value={formData.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Tell us about yourself…"
                  />
                </div>

                <div className="rounded-[32px] border border-[#eff2f7] bg-white p-6 shadow-sm">
                  <h4 className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-[#adb5bd]">Social</h4>
                  <Field label="LinkedIn">
                    <div className="relative">
                      <Link2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#adb5bd]" />
                      <input
                        className={`${inputCls} pl-10`}
                        value={formData.linkedin}
                        onChange={(e) => set("linkedin", e.target.value)}
                        placeholder="linkedin.com/in/…"
                      />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Personal Details */}
              <div className="lg:col-span-2">
                <div className="rounded-[32px] border border-[#eff2f7] bg-white p-8 shadow-sm">
                  <h4 className="mb-6 text-[11px] font-extrabold uppercase tracking-widest text-[#adb5bd]">Identity Details</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="First Name" required>
                      <input className={inputCls} value={formData.firstName} onChange={e => set("firstName", e.target.value)} />
                    </Field>
                    <Field label="Last Name" required>
                      <input className={inputCls} value={formData.lastName} onChange={e => set("lastName", e.target.value)} />
                    </Field>
                    <Field label="Department" required>
                      <div className="relative">
                        <select className={`${inputCls} appearance-none cursor-pointer`} value={formData.department} onChange={e => set("department", e.target.value)}>
                          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#adb5bd] pointer-events-none" />
                      </div>
                    </Field>
                    <Field label="Job Title">
                      <input className={inputCls} value={formData.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Lead Designer" />
                    </Field>
                    <Field label="Experience (Years)">
                      <div className="relative">
                        <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#adb5bd]" />
                        <input type="number" className={`${inputCls} pl-10`} value={formData.yearsOfExperience} onChange={e => set("yearsOfExperience", e.target.value)} />
                      </div>
                    </Field>
                    <Field label="Gender">
                      <div className="relative">
                        <select className={`${inputCls} appearance-none cursor-pointer`} value={formData.gender} onChange={e => set("gender", e.target.value)}>
                          <option>Male</option><option>Female</option><option>Other</option><option>Secret</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#adb5bd] pointer-events-none" />
                      </div>
                    </Field>
                    <Field label="Location" className="sm:col-span-2">
                      <div className="relative">
                        <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#adb5bd]" />
                        <input className={`${inputCls} pl-10`} value={formData.location} onChange={e => set("location", e.target.value)} placeholder="City, Country" />
                      </div>
                    </Field>
                  </div>

                  {/* Actions */}
                  <div className={`mt-10 flex items-center justify-between border-t border-[#f1f3f5] pt-6 transition-all duration-300 ${isDirty ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <p className="text-[11px] font-bold text-[#adb5bd]">
                      {isDirty ? "Unsaved changes detected." : "Profile is up to date."}
                    </p>
                    <button 
                      onClick={handleSave}
                      disabled={updateProfile.isPending || !isDirty}
                      className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                    >
                      {updateProfile.isPending && <Loader2 size={16} className="animate-spin" />}
                      {updateProfile.isPending ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "password" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ChangePassword />
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === "delete" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-[32px] border border-danger/20 bg-danger/5 p-10">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-danger/10 text-danger shrink-0 shadow-sm">
                  <AlertTriangle size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-extrabold text-[#343a40]">Permanent Account Deletion</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[#6c757d]">
                    This will permanently remove your account, projects, and all associated data. 
                    <span className="font-extrabold text-danger ml-1">This cannot be reversed.</span>
                  </p>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[
                       { label: "Profile Data", icon: User },
                       { label: "Created Projects", icon: FolderKanban },
                       { label: "Assigned Tasks", icon: CheckCircle2 },
                       { label: "Team Access", icon: Users }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-danger/5">
                         <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-danger/5 text-danger">
                           <item.icon size={14} />
                         </div>
                         <span className="text-[12px] font-bold text-[#343a40]">{item.label}</span>
                       </div>
                     ))}
                  </div>

                  <button className="mt-10 rounded-2xl bg-danger px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-danger/20 transition-all hover:bg-danger/90 active:scale-95">
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}