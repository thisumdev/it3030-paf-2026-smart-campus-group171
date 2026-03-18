package com.smart_campus.smart_campus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
public class SmartCampusApplication {

    public static void main(String[] args) {
        // Load .env file BEFORE Spring starts
        // This way all ${VAR} placeholders in application.yaml resolve correctly
        loadEnvFile();
        SpringApplication.run(SmartCampusApplication.class, args);
    }

    /**
     * Reads .env file from the project root (same folder as pom.xml)
     * and sets each key=value pair as a system property.
     * Spring reads system properties automatically — so ${JWT_SECRET}
     * in application.yaml resolves to whatever is in .env
     *
     * Format supported:
     *  KEY=VALUE
     *  # this is a comment (ignored)
     *  empty lines (ignored)
     */
    private static void loadEnvFile() {
        try (BufferedReader reader = new BufferedReader(new FileReader(".env"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();

                // Skip empty lines and comments
                if (line.isEmpty() || line.startsWith("#")) continue;

                int equalIndex = line.indexOf('=');
                if (equalIndex == -1) continue; // skip malformed lines

                String key   = line.substring(0, equalIndex).trim();
                String value = line.substring(equalIndex + 1).trim();

                // Only set if not already defined — allows real env vars to override .env
                // Useful in production where real environment variables take priority
                if (System.getProperty(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (IOException e) {
            // .env file not found — not an error in production
            // Production uses real environment variables, not .env
            System.out.println("[INFO] No .env file found — using system environment variables");
        }
    }
}