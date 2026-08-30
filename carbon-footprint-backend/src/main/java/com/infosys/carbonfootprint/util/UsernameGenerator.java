package com.infosys.carbonfootprint.util;

import com.infosys.carbonfootprint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class UsernameGenerator {

    @Autowired
    private UserRepository userRepository;

    private final Random random = new Random();

    public String generateUniqueUsername(String firstName, String lastName) {
        String cleanFirst = (firstName != null ? firstName : "user").replaceAll("[^a-zA-Z]", "").toLowerCase();
        String cleanLast = (lastName != null ? lastName : "").replaceAll("[^a-zA-Z]", "").toLowerCase();
        if (cleanFirst.isBlank()) cleanFirst = "user";

        String base = cleanLast.isBlank() ? cleanFirst : cleanFirst + "." + cleanLast;
        String candidate = base;

        int attempts = 0;
        while (userRepository.existsByUsername(candidate)) {
            attempts++;
            int randomNumber = 100 + random.nextInt(900);
            candidate = base + randomNumber;
            if (attempts > 100) {
                candidate = base + System.currentTimeMillis() % 10000;
                break;
            }
        }
        return candidate;
    }
}
