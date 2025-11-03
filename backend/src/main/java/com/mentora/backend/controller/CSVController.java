package com.mentora.backend.controller;

import com.mentora.backend.model.Role;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;
import com.opencsv.CSVReader;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;

@RestController
@RequestMapping("/users")
public class CSVController {

    private final UserRepository repository;

    public CSVController(UserRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/upload")
    public String uploadCSV(@RequestParam("file") MultipartFile file) {
        int count = 0;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] nextLine;
            boolean firstLine = true;

            while ((nextLine = reader.readNext()) != null) {
                if (firstLine) {
                    firstLine = false; // se salta header
                    continue;
                }

                String ci = nextLine[0];
                String nombre = nextLine[1];
                String email = nextLine[2];
                String password = nextLine[3];
                String description = nextLine[4];
                Role role = Role.valueOf(nextLine[6].toUpperCase());

                // Verificar si ya existe por email
                if (repository.findByEmail(email).isEmpty()) {
                    User user = new User(ci, nombre, email, password, description, null, null, role);
                    repository.save(user);
                    count++;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "Error al importar CSV";
        }

        return "Se importaron " + count + " usuarios correctamente";
    }
}
