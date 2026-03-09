export interface Course {
  id: string;
  name: string;
  description: string;
  room?: string;
  max_capacity: number;
  blocks: CourseBlock[];
}

export interface CourseBlock {
  id: string;
  course_id: string;
  block_name: string;
  available_slots: number;
  total_capacity: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
}

export interface RegistrationSelection {
  courseId: string;
  blockName: string; // 'A' or 'B'
  courseName: string;
  room?: string;
}
