package com.mentora.backend.responses;

import com.mentora.backend.dt.DtCourse;
import com.mentora.backend.dt.DtForum;
import com.mentora.backend.dt.DtSimpleContent;
import java.util.List;

public class GetCourseResponse {
  private DtCourse course;
  private List<DtSimpleContent> contents;
  private List<DtForum> forums;

  public GetCourseResponse() {}

  public GetCourseResponse(DtCourse course, List<DtSimpleContent> contents, List<DtForum> forums) {
    this.course = course;
    this.contents = contents;
    this.forums = forums;
  }

  public DtCourse getCourse() { return course; }
  public void setCourse(DtCourse course) { this.course = course; }

  public List<DtSimpleContent> getContents() { return contents; }
  public void setContents(List<DtSimpleContent> contents) { this.contents = contents; }

  public List<DtForum> getForums() { return forums; }
  public void setForums(List<DtForum> forums) { this.forums = forums; }
}
