import type { Course, PermissionGroupWithPackages } from "@/src/types/course";
import { API_BASE_URL } from "@/src/services/config";
import { AuthService } from "@/src/services/auth";

/**
 * Fetches all courses from the API
 * If a valid JWT token is provided, it will also return unlock status for each course
 */
export async function getAllCourses(): Promise<Course[]> {
  try {
    // Get JWT token using AuthService (stored under 'auth_token')
    const token = AuthService.getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/courses/all`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        AuthService.removeToken();
        AuthService.removeUser();
      }
      throw new Error(`Failed to fetch courses: ${response.status}`);
    }

    const data = await response.json();
    // Normalize field names to match our Course type
    // API may return `requiredGroups` (camelCase); map it to `required_groups`
    return (data || []).map((item: any) => ({
      ...item,
      required_groups: item?.required_groups ?? item?.requiredGroups ?? [],
    }));
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return [];
  }
}

/**
 * Fetches user's unlocked courses
 * Requires JWT token for authentication
 */
export async function getUnlockedCourses(): Promise<Course[]> {
  try {
    // Get JWT token using AuthService
    const token = AuthService.getToken();

    if (!token) {
      console.error("No authentication token found");
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/courses/my_courses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        AuthService.removeToken();
        AuthService.removeUser();
      }
      throw new Error(`Failed to fetch unlocked courses: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching unlocked courses:", error);
    return [];
  }
}

/**
 * Fetches all permission groups and their available packages
 */
export async function getPermissionGroups(): Promise<
  PermissionGroupWithPackages[]
> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/permission_groups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        AuthService.removeToken();
        AuthService.removeUser();
      }
      throw new Error(`Failed to fetch permission groups: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching permission groups:", error);
    return [];
  }
}
