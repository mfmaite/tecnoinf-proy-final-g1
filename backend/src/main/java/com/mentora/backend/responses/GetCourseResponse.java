package com.mentora.backend.responses;

import com.mentora.backend.dt.DtCourse;
import com.mentora.backend.dt.DtSimpleContent;
import java.util.List;

public class GetCourseResponse {
  private DtCourse course;
  private List<DtSimpleContent> contents;

  public GetCourseResponse() {}

  public GetCourseResponse(DtCourse course, List<DtSimpleContent> contents) {
    this.course = course;
    this.contents = contents;
  }

  public DtCourse getCourse() { return course; }
  public void setCourse(DtCourse course) { this.course = course; }

  public List<DtSimpleContent> getContents() { return contents; }
  public void setContents(List<DtSimpleContent> contents) { this.contents = contents; }
}
