package com.mentora.backend.repository;

import com.mentora.backend.model.Course;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.User;
import com.mentora.backend.model.UserCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCourseRepository extends JpaRepository<UserCourse, Long> {

    boolean existsByCourseAndUser(Course course, User user);

    Optional<UserCourse> findByCourseAndUser(Course course, User user);

    List<UserCourse> findAllByUser(User user);

    List<UserCourse> findAllByCourseAndUser_Role(Course course, Role role);

    List<UserCourse> findAllByCourse(Course course);
}
