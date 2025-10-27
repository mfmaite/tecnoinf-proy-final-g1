package com.mentora.backend.dt;

public class DtFinalGrade {
    private String studentCi;
    private Integer grade; // 1-12

    public DtFinalGrade() {}

    public DtFinalGrade(String studentCi, Integer grade) {
        this.studentCi = studentCi;
        this.grade = grade;
    }

    public String getStudentCi() { return studentCi; }
    public void setStudentCi(String studentCi) { this.studentCi = studentCi; }

    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
}
