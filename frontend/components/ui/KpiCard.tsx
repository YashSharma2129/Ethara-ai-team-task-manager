import { HelpCircle, LucideIcon, TrendingUp } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor: 'primary' | 'success' | 'danger' | 'warning' | 'info';
}

export const KpiCard = ({ icon: Icon, value, label, iconColor }: KpiCardProps) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary border-primary/20 shadow-primary/5',
    success: 'bg-success/10 text-success border-success/20 shadow-success/5',
    danger: 'bg-danger/10 text-danger border-danger/20 shadow-danger/5',
    warning: 'bg-warning/10 text-warning border-warning/20 shadow-warning/5',
    info: 'bg-info/10 text-info border-info/20 shadow-info/5',
  };

  return (
    <div className="relative overflow-hidden flex flex-col justify-between rounded-3xl border border-[#e9ebec] bg-white p-7 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer group">
      {/* Decorative background pattern */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#f8f8fb] opacity-50 transition-all duration-700 group-hover:scale-150 group-hover:bg-primary/5" />
      
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${colorMap[iconColor]} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={28} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-[10px] font-extrabold text-success uppercase tracking-widest bg-success/10 px-2 py-1 rounded-lg">
            <TrendingUp size={10} />
            +12%
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-3xl font-extrabold text-[#343a40] tracking-tight leading-none mb-2">
          {value}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#6c757d] uppercase tracking-widest opacity-80">{label}</p>
          <HelpCircle size={14} className="text-[#adb5bd] hover:text-primary transition-colors cursor-help" />
        </div>
      </div>
    </div>
  );
};
