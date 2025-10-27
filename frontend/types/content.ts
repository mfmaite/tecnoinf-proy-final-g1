import { Course } from "./course";

export type SimpleContent = {
  id: number
  title: string
  content: string | null
  fileName: string | null
  fileUrl: string | null
  createdDate: string
}

export type CourseViewData = {
  course: Course
  contents: SimpleContent[]
}
