import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Pencil, Calendar, Clock, FileText, Tag } from "lucide-react";
import type { Course } from "@/lib/api";
import { getCourse } from "@/lib/api";
import { statusStyle, formatDateLong } from "@/lib/format";

interface CourseDetailProps {
  open: boolean;
  courseId: number | null;
  onClose: () => void;
  onEdit: (course: Course) => void;
}

export function CourseDetail({ open, courseId, onClose, onEdit }: CourseDetailProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || courseId === null) {
      setCourse(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCourse(null);
    getCourse(courseId)
      .then((res) => {
        if (!cancelled) setCourse(res.course);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load course details");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, courseId]);

  return (
    <Modal open={open} onClose={onClose} title="Course Details" size="lg">
      <div className="px-6 py-5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="h-10 w-10 rounded-full border-4 border-slate-100" />
              <div className="absolute inset-0 h-10 w-10 rounded-full border-4 border-transparent border-t-sky-500 animate-spin" />
            </div>
            <p className="text-sm text-slate-500 mt-3">Loading course details...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-700">Could not load course</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
        )}

        {course && !loading && !error && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{course.name}</h3>
              <div className="mt-2">
                <StatusBadge status={course.status} />
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                <FileText className="h-3.5 w-3.5" />
                Description
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow icon={Calendar} label="Target Date" value={formatDateLong(course.target_date)} />
              <DetailRow icon={Clock} label="Created Date" value={formatDateLong(course.created_at)} />
              <DetailRow icon={Tag} label="Status" value={course.status} />
              <DetailRow icon={FileText} label="Course ID" value={`#${course.id}`} />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onEdit(course)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Edit Course
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-slate-200 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-sm text-slate-800 font-medium">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style = statusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
