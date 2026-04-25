package com.smart_campus.smart_campus.core.config;

import com.smart_campus.smart_campus.user.entity.User;
import com.smart_campus.smart_campus.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedTechnician();
    }

    private void seedAdmin() {
        if (userRepository.findByEmail("admin@smartcampus.lk").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@smartcampus.lk");
            admin.setPassword(passwordEncoder.encode("Admin123"));
            admin.setFullName("Admin");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Admin user created");
        } else {
            System.out.println("ℹ️ Admin user already exists, skipping.");
        }
    }

    private void seedTechnician() {
        if (userRepository.findByEmail("tech@smartcampus.lk").isEmpty()) {
            User tech = new User();
            tech.setEmail("tech@smartcampus.lk");
            tech.setPassword(passwordEncoder.encode("Tech1234"));
            tech.setFullName("Technician");
            tech.setRole(User.Role.TECHNICIAN);
            userRepository.save(tech);
            System.out.println("✅ Technician user created");
        } else {
            System.out.println("ℹ️ Technician user already exists, skipping.");
        }
    }
}