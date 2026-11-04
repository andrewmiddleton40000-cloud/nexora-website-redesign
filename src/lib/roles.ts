// Shared role definitions. Authorisation is always enforced on the server (src/server/*).
export const ROLES = ['super_admin', 'academic_admin', 'finance_admin', 'instructor', 'school_partner', 'student'] as const
export type Role = (typeof ROLES)[number]

export const roleLabels: Record<Role, string> = {
  super_admin: 'Super Administrator',
  academic_admin: 'Academic Administrator',
  finance_admin: 'Finance Administrator',
  instructor: 'Instructor',
  school_partner: 'School Partner',
  student: 'Student',
}

export const STAFF: Role[] = ['super_admin', 'academic_admin', 'finance_admin', 'instructor']
export const ACADEMIC: Role[] = ['super_admin', 'academic_admin']
export const ACADEMIC_OR_INSTRUCTOR: Role[] = ['super_admin', 'academic_admin', 'instructor']
/** The only roles allowed to see institutional allocations, revenue or payment records. */
export const FINANCE: Role[] = ['super_admin', 'finance_admin']

export type AdminTab = 'overview' | 'students' | 'schools' | 'courses' | 'payments' | 'academic' | 'finance' | 'content'

export const adminTabs: Array<{ id: AdminTab; label: string; roles: Role[] }> = [
  { id: 'overview', label: 'Overview', roles: ['super_admin', 'academic_admin', 'finance_admin', 'instructor'] },
  { id: 'students', label: 'Students', roles: ACADEMIC },
  { id: 'schools', label: 'Schools', roles: ACADEMIC },
  { id: 'courses', label: 'Courses', roles: ACADEMIC },
  { id: 'academic', label: 'Academic', roles: ACADEMIC_OR_INSTRUCTOR },
  { id: 'payments', label: 'Payments', roles: FINANCE },
  { id: 'finance', label: 'Restricted finance', roles: FINANCE },
  { id: 'content', label: 'Enquiries & content', roles: ACADEMIC },
]

export function hasRole(role: string | undefined | null, allowed: readonly Role[]) {
  return !!role && (allowed as readonly string[]).includes(role)
}
