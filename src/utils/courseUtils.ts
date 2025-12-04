import type { Course, CourseType } from '@/src/types/course'

/**
 * 从描述中提取排序数字标记 {数字}
 * @param description 课程描述
 * @returns 排序数字，如果没有找到则返回 Infinity
 */
export function extractSortOrder(description: string): number {
  const match = description.match(/\{(\d+)\}/)
  return match ? Number.parseInt(match[1], 10) : Number.POSITIVE_INFINITY
}

/**
 * 清除描述中的排序标记 {数字}
 * @param description 课程描述
 * @returns 清除标记后的描述
 */
export function cleanDescription(description: string): string {
  return description.replace(/\{\d+\}/g, '').trim()
}

/**
 * 根据描述中的排序标记对课程进行排序
 * @param courses 课程列表
 * @returns 排序后的课程列表（带清理后的描述）
 */
export function sortAndCleanCourses(courses: Course[]): Course[] {
  // 先按排序数字排序
  const sorted = [...courses].sort((a, b) => {
    const orderA = extractSortOrder(a.description)
    const orderB = extractSortOrder(b.description)
    return orderA - orderB
  })

  // 清除描述中的排序标记
  return sorted.map((course) => ({
    ...course,
    description: cleanDescription(course.description)
  }))
}

export function filterCoursesByUnlockStatus(
  courses: Course[],
  unlocked: boolean
): Course[] {
  return courses.filter((course) => course.isUnlocked === unlocked)
}

export function enrichCoursesWithUIData(courses: Course[]): Course[] {
  return courses.map((course) => {
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

    const duration = course.duration || '课时：8课时 | 总时长：2小时'

    return {
      ...course,
      category,
      level,
      duration
    }
  })
}

export function filterCoursesByType(
  courses: Course[],
  type: CourseType
): Course[] {
  return courses.filter((course) => course.course_type === type)
}

export function processCourses(
  allCourses: Course[],
  courseType: CourseType = 'article'
): {
  unlockedCourses: Course[]
  lockedCourses: Course[]
} {
  const filteredCourses = filterCoursesByType(allCourses, courseType)

  const unlockedCourses = filterCoursesByUnlockStatus(filteredCourses, true)
  const lockedCourses = filterCoursesByUnlockStatus(filteredCourses, false)

  const enrichedUnlockedCourses = enrichCoursesWithUIData(unlockedCourses)
  const enrichedLockedCourses = enrichCoursesWithUIData(lockedCourses)

  // 对课程进行排序并清理描述中的排序标记
  const sortedUnlockedCourses = sortAndCleanCourses(enrichedUnlockedCourses)
  const sortedLockedCourses = sortAndCleanCourses(enrichedLockedCourses)

  return {
    unlockedCourses: sortedUnlockedCourses,
    lockedCourses: sortedLockedCourses
  }
}

export function extractUrlFromContent(content: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = content.match(urlRegex)

  return matches && matches.length > 0 ? matches[0] : ''
}
