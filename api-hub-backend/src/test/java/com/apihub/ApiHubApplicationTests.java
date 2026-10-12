package com.apihub;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ApiHubApplicationTests {

    @Test
    void contextLoads() {
        // Passes if the whole Spring application (security, JPA, seeding...) starts without errors.
    }
}
