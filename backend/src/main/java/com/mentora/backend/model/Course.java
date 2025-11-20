package com.mentora.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Courses")
public class Course {

    @Id
    @Column(length = 10, nullable = false, unique = true)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "createdDate")
    private LocalDateTime createdDate = LocalDateTime.now();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Forum> forums = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SimpleContent> simpleContents = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "course-quizzes")
    private List<Quiz> quizzes = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evaluation> evaluations = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserCourse> userCourses = new ArrayList<>();

    // Constructores
    public Course() {}

    public Course(String id, String name, LocalDateTime createdDate) {
        this.id = id;
        this.name = name;
        this.createdDate = createdDate;
    }

    // Getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public List<Forum> getForums() { return forums; }
    public void setForums(List<Forum> forums) { this.forums = forums; }

    public void addForum(Forum forum) {
        forums.add(forum);
        forum.setCourse(this);
    }

    public void removeForum(Forum forum) {
        forums.remove(forum);
        forum.setCourse(null);
    }

    public List<SimpleContent> getSimpleContents() { return simpleContents; }
    public void setSimpleContents(List<SimpleContent> simpleContents) { this.simpleContents = simpleContents; }

    public void addSimpleContent(SimpleContent sc) {
        simpleContents.add(sc);
        sc.setCourse(this);
    }

    public void removeSimpleContent(SimpleContent sc) {
        simpleContents.remove(sc);
        sc.setCourse(null);
    }

    public List<Quiz> getQuizzes() { return quizzes; }
    public void setQuizzes(List<Quiz> quizzes) { this.quizzes = quizzes; }

    public void addQuiz(Quiz quiz) {
        quizzes.add(quiz);
        quiz.setCourse(this);
    }

    public void removeQuiz(Quiz quiz) {
        quizzes.remove(quiz);
        quiz.setCourse(null);
    }

    public List<Evaluation> getEvaluations() { return evaluations; }
    public void setEvaluations(List<Evaluation> evaluations) { this.evaluations = evaluations; }

    public void addEvaluation(Evaluation evaluation) {
        evaluations.add(evaluation);
    }

    public void removeEvaluation(Evaluation evaluation) {
        evaluations.remove(evaluation);
        evaluation.setCourse(null);
    }

    public List<UserCourse> getUserCourses() { return userCourses; }
    public void setUserCourses(List<UserCourse> userCourses) { this.userCourses = userCourses; }

    public void addUserCourse(UserCourse uc) {
        userCourses.add(uc);
        uc.setCourse(this);
    }

    public void removeUserCourse(UserCourse uc) {
        userCourses.remove(uc);
        uc.setCourse(null);
    }

}
