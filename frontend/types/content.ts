import { Course } from "./course";
import { Forum } from "./forum";

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
  forums: Forum[]
}
