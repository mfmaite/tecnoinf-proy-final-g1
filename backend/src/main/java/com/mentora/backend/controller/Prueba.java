package com.mentora.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Prueba {

    @GetMapping("/")
    public String prueba() {
        return "¡Backend funcionando!";
    }

    @GetMapping("/test")
    public String test() {
        return "Endpoint /test OK";
    }
}

