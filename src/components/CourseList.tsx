import { Eye, Pencil, Trash2, Calendar, Clock } from "lucide-react";
import type { Course } from "@/lib/api";
import { statusStyle, formatDate, isCourseOverdue } from "@/lib/format";

interface CourseListProps {
  courses: Course[];
  loading: boolean;
  search: string;
  error: string | null;
  onRetry: () => void;
  onView: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export function CourseList({
  courses,
  loading,
  search,
  error,
  onRetry,
  onView,
  onEdit,
  onDelete,
}: CourseListProps) {
  if (loading && courses.length === 0) {
    return <LoadingState />;
  }

  if (error && courses.length === 0) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (courses.length === 0) {
    return <EmptyState hasSearch={false} />;
  }

  if (courses.length === 0 && search) {
    return <EmptyState hasSearch />;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                Course
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                Target Date
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                Created
              </th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function CourseRow({
  course,
  onView,
  onEdit,
  onDelete,
}: {
  course: Course;
  onView: (c: Course) => void;
  onEdit: (c: Course) => void;
  onDelete: (c: Course) => void;
}) {
  const style = statusStyle(course.status);
  const overdue = isCourseOverdue(course);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="max-w-xs">
          <p className="text-sm font-medium text-slate-900 truncate">{course.name}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{course.description}</p>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className={`text-sm ${overdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
            {formatDate(course.target_date)}
          </span>
          {overdue && (
            <span className="text-xs text-red-500 font-medium">Overdue</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge style={style} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-slate-500">{formatDate(course.created_at)}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1">
          <ActionButton onClick={() => onView(course)} title="View" variant="ghost">
            <Eye className="h-4 w-4" />
          </ActionButton>
          <ActionButton onClick={() => onEdit(course)} title="Edit" variant="ghost">
            <Pencil className="h-4 w-4" />
          </ActionButton>
          <ActionButton onClick={() => onDelete(course)} title="Delete" variant="danger">
            <Trash2 className="h-4 w-4" />
          </ActionButton>
        </div>
      </td>
    </tr>
  );
}

function CourseCard({
  course,
  onView,
  onEdit,
  onDelete,
}: {
  course: Course;
  onView: (c: Course) => void;
  onEdit: (c: Course) => void;
  onDelete: (c: Course) => void;
}) {
  const style = statusStyle(course.status);
  const overdue = isCourseOverdue(course);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{course.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{course.description}</p>
        </div>
        <StatusBadge style={style} />
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className={overdue ? "text-red-600 font-medium" : ""}>
            {formatDate(course.target_date)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(course.created_at)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ActionButton onClick={() => onView(course)} title="View" variant="ghost">
          <Eye className="h-4 w-4" />
          <span className="text-xs">View</span>
        </ActionButton>
        <ActionButton onClick={() => onEdit(course)} title="Edit" variant="ghost">
          <Pencil className="h-4 w-4" />
          <span className="text-xs">Edit</span>
        </ActionButton>
        <ActionButton onClick={() => onDelete(course)} title="Delete" variant="danger">
          <Trash2 className="h-4 w-4" />
          <span className="text-xs">Delete</span>
        </ActionButton>
      </div>
    </div>
  );
}

function StatusBadge({ style }: { style: ReturnType<typeof statusStyle> }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  title,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  variant: "ghost" | "danger";
}) {
  const classes =
    variant === "danger"
      ? "text-slate-500 hover:text-red-600 hover:bg-red-50"
      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100";
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors ${classes}`}
    >
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-sky-500 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-700 mt-4">Loading courses...</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          The server may be waking up. This may take a few seconds...
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-50">
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700 mt-4">Something went wrong</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">{message}</p>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700 mt-4">
          {hasSearch ? "No courses found" : "No courses yet"}
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          {hasSearch
            ? "Try adjusting your search terms."
            : "Get started by adding your first course."}
        </p>
      </div>
    </div>
  );
}
