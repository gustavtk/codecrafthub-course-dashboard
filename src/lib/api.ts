const API_BASE_URL = "https://codecrafthub-cu98.onrender.com";

export interface Course {
  id: number;
  name: string;
  description: string;
  target_date: string;
  status: "Not Started" | "In Progress" | "Completed";
  created_at: string;
}

export interface CourseInput {
  name: string;
  description: string;
  target_date: string;
  status: "Not Started" | "In Progress" | "Completed";
}

export interface CoursesResponse {
  success: boolean;
  count: number;
  courses: Course[];
}

export interface CourseResponse {
  success: boolean;
  course: Course;
}

export interface StatsResponse {
  success: boolean;
  stats: {
    total: number;
    by_status: {
      "Not Started": number;
      "In Progress": number;
      "Completed": number;
    };
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export const STATUS_VALUES = ["Not Started", "In Progress", "Completed"] as const;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error || body?.message || "";
    } catch {
      // non-JSON error body
    }
    throw new Error(detail || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

export async function getCourses(): Promise<CoursesResponse> {
  return request<CoursesResponse>("/api/courses");
}

export async function getCourse(id: number): Promise<CourseResponse> {
  return request<CourseResponse>(`/api/courses/${id}`);
}

export async function addCourse(courseData: CourseInput): Promise<CourseResponse> {
  return request<CourseResponse>("/api/courses", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(courseData),
  });
}

export async function updateCourse(id: number, courseData: Partial<CourseInput>): Promise<CourseResponse> {
  return request<CourseResponse>(`/api/courses/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(courseData),
  });
}

export async function deleteCourse(id: number): Promise<DeleteResponse> {
  return request<DeleteResponse>(`/api/courses/${id}`, {
    method: "DELETE",
  });
}

export async function getStats(): Promise<StatsResponse> {
  return request<StatsResponse>("/api/courses/stats");
}
