import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { STATUS_VALUES, type Course, type CourseInput } from "@/lib/api";

interface CourseFormProps {
  open: boolean;
  mode: "add" | "edit";
  course: Course | null;
  submitting: boolean;
  onSubmit: (data: CourseInput) => void;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  description?: string;
  target_date?: string;
  status?: string;
}

export function CourseForm({ open, mode, course, submitting, onSubmit, onClose }: CourseFormProps) {
  const [formData, setFormData] = useState<CourseInput>({
    name: "",
    description: "",
    target_date: "",
    status: "Not Started",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      if (mode === "edit" && course) {
        setFormData({
          name: course.name,
          description: course.description,
          target_date: course.target_date,
          status: course.status,
        });
      } else {
        setFormData({ name: "", description: "", target_date: "", status: "Not Started" });
      }
      setErrors({});
    }
  }, [open, mode, course]);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!formData.name.trim()) next.name = "Course name is required";
    if (!formData.description.trim()) next.description = "Description is required";
    if (!formData.target_date) next.target_date = "Target date is required";
    if (!formData.status) next.status = "Status is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      target_date: formData.target_date,
      status: formData.status,
    });
  }

  function update<K extends keyof CourseInput>(key: K, value: CourseInput[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "add" ? "Add New Course" : "Edit Course"} size="md">
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5" noValidate>
        <Field label="Course Name" required error={errors.name}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Introduction to Python"
            className={inputClass(!!errors.name)}
            autoFocus
          />
        </Field>

        <Field label="Description" required error={errors.description}>
          <textarea
            value={formData.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Brief description of the course..."
            rows={3}
            className={inputClass(!!errors.description)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Target Date" required error={errors.target_date}>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => update("target_date", e.target.value)}
              className={inputClass(!!errors.target_date)}
            />
          </Field>

          <Field label="Status" required error={errors.status}>
            <select
              value={formData.status}
              onChange={(e) => update("status", e.target.value as CourseInput["status"])}
              className={inputClass(!!errors.status)}
            >
              {STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            {mode === "add" ? "Create Course" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return [
    "w-full h-10 px-3 rounded-lg border bg-white text-sm text-slate-700 placeholder:text-slate-400",
    "focus:outline-none focus:ring-2 transition-colors",
    hasError
      ? "border-red-300 focus:ring-red-500/20 focus:border-red-400"
      : "border-slate-200 focus:ring-sky-500/20 focus:border-sky-400",
  ].join(" ");
}
