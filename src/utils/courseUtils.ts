import type { Course, CourseType } from '@/src/types/course'

/**
 * Filters courses by their unlock status
 * @param courses Array of courses to filter
 * @param unlocked Whether to return unlocked (true) or locked (false) courses
 * @returns Filtered courses
 */
export function filterCoursesByUnlockStatus(
  courses: Course[],
  unlocked: boolean
): Course[] {
  return courses.filter((course) => course.isUnlocked === unlocked)
}

/**
 * Maps API course data to include additional UI fields
 * @param courses Array of courses from API
 * @returns Courses with added UI display fields
 */
export function enrichCoursesWithUIData(courses: Course[]): Course[] {
  return courses.map((course) => {
    // Set default UI values based on course_type
    let category = ''
    let level = '基础'

    switch (course.course_type) {
      case 'article':
        category = '学习资源'
        break
      case 'dark_horse':
        category = '黑马模型'
        level = '进阶'
        break
      case 'signal':
        category = '策略信号'
        level = '高级'
        break
      case 'loop_comm':
        category = 'Loop社区'
        break
      case 'broker':
        category = '经纪商'
        level = '进阶'
        break
    }

    // Generate a placeholder duration if not provided
    const duration = course.duration || '课时：8课时 | 总时长：2小时'

    return {
      ...course,
      category,
      level,
      duration
    }
  })
}

/**
 * Processes courses fetched from API to prepare them for display
 * @param allCourses All courses from API
 * @param unlockedCourses User's unlocked courses
 * @returns Object containing unlocked and locked courses with UI enhancements
 */
/**
 * Filters courses by course_type
 * @param courses Array of courses to filter
 * @param type Type of courses to keep
 * @returns Filtered courses by type
 */
export function filterCoursesByType(
  courses: Course[],
  type: CourseType
): Course[] {
  return courses.filter((course) => course.course_type === type)
}

/**
 * Process courses for a specific page/view
 * @param allCourses All courses from API
 * @param courseType Type of courses to filter for
 * @returns Object containing unlocked and locked courses with UI enhancements
 */
export function processCourses(
  allCourses: Course[],
  courseType: CourseType = 'article'
): {
  unlockedCourses: Course[]
  lockedCourses: Course[]
} {
  // Filter courses by the specified type
  const filteredCourses = filterCoursesByType(allCourses, courseType)

  // Filter courses by unlock status
  const unlockedCourses = filterCoursesByUnlockStatus(filteredCourses, true)
  const lockedCourses = filterCoursesByUnlockStatus(filteredCourses, false)

  // Add UI display data
  const enrichedUnlockedCourses = enrichCoursesWithUIData(unlockedCourses)
  const enrichedLockedCourses = enrichCoursesWithUIData(lockedCourses)

  return {
    unlockedCourses: enrichedUnlockedCourses,
    lockedCourses: enrichedLockedCourses
  }
}

/**
 * Extract URLs from course content if it contains links
 * @param content Course content that might contain a URL
 * @returns The extracted URL or empty string if none found
 */
export function extractUrlFromContent(content: string): string {
  // Simple regex to find URLs in content
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = content.match(urlRegex)

  return matches && matches.length > 0 ? matches[0] : ''
}
