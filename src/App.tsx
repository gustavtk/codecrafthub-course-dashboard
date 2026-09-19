import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { SearchBar } from "@/components/SearchBar";
import { CourseList } from "@/components/CourseList";
import { CourseForm } from "@/components/CourseForm";
import { CourseDetail } from "@/components/CourseDetail";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ToastContainer, createToast, type ToastMessage, type ToastType } from "@/components/Toast";
import {
  getCourses,
  getStats,
  addCourse,
  updateCourse,
  deleteCourse,
  type Course,
  type CourseInput,
  type StatsResponse,
} from "@/lib/api";

export function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<StatsResponse["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCourseId, setDetailCourseId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToasts((prev) => [...prev, createToast(type, message)]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCourses();
      setCourses(res.courses || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load courses";
      setError(msg);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getStats();
      setStats(res.stats);
    } catch {
      setStats({ total: 0, by_status: { "Not Started": 0, "In Progress": 0, "Completed": 0 } });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadCourses(), loadStats()]);
    setRefreshing(false);
  }, [loadCourses, loadStats]);

  useEffect(() => {
    loadCourses();
    loadStats();
  }, [loadCourses, loadStats]);

  const filteredCourses = search
    ? courses.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q)
        );
      })
    : courses;

  function handleAddClick() {
    setFormMode("add");
    setEditingCourse(null);
    setFormOpen(true);
  }

  function handleEditClick(course: Course) {
    setFormMode("edit");
    setEditingCourse(course);
    setFormOpen(true);
    setDetailOpen(false);
  }

  function handleViewClick(course: Course) {
    setDetailCourseId(course.id);
    setDetailOpen(true);
  }

  function handleDeleteClick(course: Course) {
    setDeleteTarget(course);
  }

  async function handleFormSubmit(data: CourseInput) {
    setFormSubmitting(true);
    try {
      if (formMode === "edit" && editingCourse) {
        await updateCourse(editingCourse.id, data);
        showToast("success", "Course updated successfully");
      } else {
        await addCourse(data);
        showToast("success", "Course created successfully");
      }
      setFormOpen(false);
      setEditingCourse(null);
      await Promise.all([loadCourses(), loadStats()]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save course";
      showToast("error", msg);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCourse(deleteTarget.id);
      showToast("success", "Course deleted successfully");
      setDeleteTarget(null);
      await Promise.all([loadCourses(), loadStats()]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete course";
      showToast("error", msg);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAddCourse={handleAddClick} onRefresh={refreshAll} refreshing={refreshing} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <StatsCards stats={stats} loading={statsLoading} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Courses</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {courses.length} {courses.length === 1 ? "course" : "courses"} total
              {search && ` · ${filteredCourses.length} matching`}
            </p>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <CourseList
          courses={filteredCourses}
          loading={loading}
          search={search}
          error={error}
          onRetry={refreshAll}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </main>

      <CourseForm
        open={formOpen}
        mode={formMode}
        course={editingCourse}
        submitting={formSubmitting}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setFormOpen(false);
          setEditingCourse(null);
        }}
      />

      <CourseDetail
        open={detailOpen}
        courseId={detailCourseId}
        onClose={() => setDetailOpen(false)}
        onEdit={(course) => handleEditClick(course)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
