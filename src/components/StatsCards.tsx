import { BookOpen, CircleDashed, Loader, CheckCircle2 } from "lucide-react";
import type { StatsResponse } from "@/lib/api";

interface StatsCardsProps {
  stats: StatsResponse["stats"] | null;
  loading: boolean;
}

interface CardConfig {
  key: string;
  label: string;
  icon: typeof BookOpen;
  color: string;
  iconBg: string;
  value: (stats: StatsResponse["stats"]) => number;
}

const cards: CardConfig[] = [
  {
    key: "total",
    label: "Total Courses",
    icon: BookOpen,
    color: "text-slate-900",
    iconBg: "bg-slate-100 text-slate-600",
    value: (s) => s.total,
  },
  {
    key: "not-started",
    label: "Not Started",
    icon: CircleDashed,
    color: "text-slate-700",
    iconBg: "bg-slate-100 text-slate-500",
    value: (s) => s.by_status["Not Started"],
  },
  {
    key: "in-progress",
    label: "In Progress",
    icon: Loader,
    color: "text-amber-700",
    iconBg: "bg-amber-50 text-amber-600",
    value: (s) => s.by_status["In Progress"],
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    color: "text-emerald-700",
    iconBg: "bg-emerald-50 text-emerald-600",
    value: (s) => s.by_status["Completed"],
  },
];

export function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats ? card.value(stats) : null;
        return (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${card.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              {loading && value === null ? (
                <div className="h-8 w-12 bg-slate-100 rounded animate-pulse" />
              ) : (
                <span className={`text-3xl font-bold ${card.color}`}>
                  {value ?? 0}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1 font-medium">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
