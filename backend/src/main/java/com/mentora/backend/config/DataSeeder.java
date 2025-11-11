package com.mentora.backend.config;

import com.mentora.backend.model.Course;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.User;
import com.mentora.backend.model.UserCourse;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.repository.UserCourseRepository;
import com.mentora.backend.repository.CourseRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CourseRepository courseRepository;
    private final UserCourseRepository userCourseRepository;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder
            , UserCourseRepository userCourseRepository
            , CourseRepository courseRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userCourseRepository = userCourseRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedCourses();
    }

    private void seedUsers() {
        // Usuario Admin
        if (userRepository.findByEmail("admin@mentora.com").isEmpty()) {
            User admin = new User(
                "11111111",
                "Administrador",
                "admin@mentora.com",
                passwordEncoder.encode("Admin123"),
                "Usuario administrador del sistema",
                null,
                null,
                Role.ADMIN
            );
            userRepository.save(admin);
            System.out.println("✓ Usuario ADMIN creado: admin@mentora.com");
        }

        // Usuario Profesor
        if (userRepository.findByEmail("profesor@mentora.com").isEmpty()) {
            User profesor = new User(
                "22222222",
                "Juan Pérez",
                "profesor@mentora.com",
                passwordEncoder.encode("Profesor123"),
                "Profesor de matemáticas con 10 años de experiencia",
                null,
                null,
                Role.PROFESOR
            );
            userRepository.save(profesor);
            System.out.println("✓ Usuario PROFESOR creado: profesor@mentora.com");
        }

        // Usuario Estudiante
        if (userRepository.findByEmail("estudiante@mentora.com").isEmpty()) {
            User estudiante = new User(
                "33333333",
                "María González",
                "estudiante@mentora.com",
                passwordEncoder.encode("Estudiante123"),
                "Estudiante de segundo año",
                null,
                null,
                Role.ESTUDIANTE
            );
            userRepository.save(estudiante);
            System.out.println("✓ Usuario ESTUDIANTE creado: estudiante@mentora.com");
        }

        System.out.println("=== Seed de usuarios completado ===");
    }
    private void seedCourses() {

        User estudiante = new User(
                "33333333",
                "María González",
                "estudiante@mentora.com",
                passwordEncoder.encode("estudiante123"),
                "Estudiante de segundo año",
                null,
                null,
                Role.ESTUDIANTE
        );
        Course curso = new Course(
            "mate1995",
            "Matematicas 1995",
            null
        );
        if (courseRepository.findById("mate1995").isEmpty()) {
            courseRepository.save(curso);
        }
        if (userCourseRepository.findByCourseAndUser(curso, estudiante).isEmpty()) {
            UserCourse uc = new UserCourse(curso, estudiante,12);
            userCourseRepository.save(uc);
        }

        System.out.println("=== Seed de curso y usuario participante completado ===");
    }

}

