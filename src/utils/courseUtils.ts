import type { Course, CourseType } from '@/src/types/course'

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

  return {
    unlockedCourses: enrichedUnlockedCourses,
    lockedCourses: enrichedLockedCourses
  }
}

export function extractUrlFromContent(content: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = content.match(urlRegex)

  return matches && matches.length > 0 ? matches[0] : ''
}
