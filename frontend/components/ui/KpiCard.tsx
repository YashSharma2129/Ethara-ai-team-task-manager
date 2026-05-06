import { HelpCircle, LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor: string;
}

export const KpiCard = ({ icon: Icon, value, label, iconColor }: KpiCardProps) => (
  <div className="flex items-center gap-4 rounded-xl border border-[#e9ebec] bg-white p-5 shadow-sm transition-all hover:shadow-md cursor-pointer group">
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${iconColor}/10 text-${iconColor} transition-all group-hover:scale-110`}>
      <Icon size={22} strokeWidth={2} />
    </div>
    <div className="flex-1">
      <div className="flex items-start justify-between">
        <p className="text-2xl font-bold text-[#343a40]">{value}</p>
        <HelpCircle size={14} className="text-[#adb5bd] cursor-help" />
      </div>
      <p className="text-sm font-medium text-[#6c757d]">{label}</p>
    </div>
  </div>
);
