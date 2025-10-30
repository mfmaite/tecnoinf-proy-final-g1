package com.mentora.backend.responses;

import com.mentora.backend.dt.DtCourse;
import java.util.List;

public class BulkCreateCoursesResponse {
    private List<DtCourse> createdCourses;
    private List<String> errors;

    public BulkCreateCoursesResponse() {}

    public BulkCreateCoursesResponse(List<DtCourse> createdCourses, List<String> errors) {
        this.createdCourses = createdCourses;
        this.errors = errors;
    }

    public List<DtCourse> getCreatedCourses() { return createdCourses; }
    public void setCreatedCourses(List<DtCourse> createdCourses) { this.createdCourses = createdCourses; }

    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
}


