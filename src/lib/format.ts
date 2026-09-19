import type { Course } from "./api";

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type StatusStyle = {
  badge: string;
  dot: string;
  label: string;
};

export function statusStyle(status: string): StatusStyle {
  switch (status) {
    case "Not Started":
      return {
        badge: "bg-slate-100 text-slate-700 border border-slate-200",
        dot: "bg-slate-400",
        label: "Not Started",
      };
    case "In Progress":
      return {
        badge: "bg-amber-50 text-amber-700 border border-amber-200",
        dot: "bg-amber-500",
        label: "In Progress",
      };
    case "Completed":
      return {
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        dot: "bg-emerald-500",
        label: "Completed",
      };
    default:
      return {
        badge: "bg-slate-100 text-slate-700 border border-slate-200",
        dot: "bg-slate-400",
        label: status,
      };
  }
}

export function isCourseOverdue(course: Course): boolean {
  if (course.status === "Completed") return false;
  if (!course.target_date) return false;
  const target = new Date(course.target_date);
  if (Number.isNaN(target.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target < today;
}
