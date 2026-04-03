// ─── Subject & Class ──────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
}

export interface Class {
  id: string;
  name: string;
  level: number;
  description?: string;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  isActive?: boolean;
  createdAt: string;
}

export interface TutorSubject {
  tutorId: string;
  subjectId: string;
  subjectName: string;
  priceOverride?: number;
  baseHourlyRate: number;
}

export interface TutorClass {
  tutorId: string;
  classId: string;
  className: string;
  level: number;
}

export interface Tutor {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  subjects: TutorSubject[];
  classes: TutorClass[];
  bio?: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  education?: string;
  yearsOfExperience?: number;
}

export interface AdminTutor extends Tutor {
  isActive: boolean;
  createdAt: string;
}

export interface AdminTutorSearchResult {
  tutors: AdminTutor[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TutorSearchResult {
  tutors: Tutor[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TutorStats {
  totalTutors: number;
  verifiedTutors: number;
  unverifiedTutors: number;
  availableTutors: number;
  unavailableTutors: number;
}

export interface CreateTutorRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  bio?: string;
  hourlyRate: number;
  education?: string;
  yearsOfExperience?: number;
  subjectIds?: string[];
  classIds?: string[];
}

export interface UpdateTutorRequest {
  bio?: string;
  hourlyRate?: number;
  education?: string;
  yearsOfExperience?: number;
  subjectIds?: string[];
  classIds?: string[];
  isVerified?: boolean;
  isAvailable?: boolean;
}

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  subjectId: string;
  subjectName: string;
  classId?: string;
  className?: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  notes?: string;
  meetingLink?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  tutorId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ─── OpenClass ─────────────────────────────────────────────────────────────────

export interface OpenClass {
  id: string;
  adminId: string;
  adminName: string;
  tutorId: string;
  tutorName: string;
  subjectId: string;
  subjectName: string;
  classId?: string;
  className?: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  maxStudents: number;
  currentStudents: number;
  pricePerStudent: number;
  totalRevenue: number;
  startDate: string;
  endDate: string;
  scheduleDesc?: string;
  totalSessions: number;
  status: string;
  isPublished: boolean;
  pendingCount: number;
  approvedCount: number;
  createdAt: string;
}

export interface OpenClassList {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  tutorName: string;
  subjectName: string;
  className?: string;
  maxStudents: number;
  currentStudents: number;
  pricePerStudent: number;
  startDate: string;
  endDate: string;
  scheduleDesc?: string;
  totalSessions: number;
  status: string;
  isPublished: boolean;
  createdAt: string;
}

export interface OpenClassSearchResult {
  items: OpenClassList[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface OpenClassSearchQuery {
  subjectId?: string;
  classId?: string;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  status?: string;
}

// ─── ClassEnrollment ─────────────────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  openClassId: string;
  classTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  status: string;
  paymentStatus: string;
  paymentId?: string;
  amountPaid?: number;
  enrolledAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

// ─── ClassSession ───────────────────────────────────────────────────────────────

export interface ClassSession {
  id: string;
  openClassId: string;
  classTitle: string;
  sessionNumber: number;
  title?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  notes?: string;
  isCompleted: boolean;
  attendanceCount: number;
  presentCount: number;
  createdAt: string;
}

// ─── SessionAttendance ───────────────────────────────────────────────────────────

export interface Attendance {
  id: string;
  sessionId: string;
  enrollmentId: string;
  studentName: string;
  studentAvatar?: string;
  status: string;
  markedAt?: string;
}

// ─── RefundRequest ─────────────────────────────────────────────────────────────

export interface RefundRequest {
  id: string;
  enrollmentId: string;
  classTitle: string;
  studentId: string;
  studentName: string;
  amount: number;
  reason?: string;
  status: string;
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
}

// ─── Payment (extended for class enrollment) ───────────────────────────────────

export interface Payment {
  id: string;
  bookingId?: string;
  classEnrollmentId?: string;
  studentId: string;
  tutorId: string;
  amount: number;
  platformFee: number;
  tutorPayout: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
}

// ─── PublicPricingCard ─────────────────────────────────────────────────────────

export interface PublicPricingCard {
  id: string;
  sortOrder: number;
  title: string;
  subtitle?: string;
  priceLabel: string;
  priceUnit?: string;
  features: string[];
  isPopular: boolean;
  themeKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminStats {
  totalUsers: number;
  studentCount: number;
  tutorCount: number;
  adminCount: number;
  inactiveCount: number;
}
