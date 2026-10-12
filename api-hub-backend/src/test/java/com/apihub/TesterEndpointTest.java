package com.apihub;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static com.apihub.TestSupport.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** None of these tests contact the internet: every request is rejected before any connection is made. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TesterEndpointTest {

    @Autowired
    MockMvc mvc;

    private String body(String apiId, String method, String url) throws Exception {
        return MAPPER.writeValueAsString(Map.of("apiId", apiId, "method", method, "url", url));
    }

    @Test
    void requiresLogin() throws Exception {
        mvc.perform(post("/api/tester/execute").contentType("application/json")
                        .content(body("openai", "GET", "https://api.openai.com/v1/models")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void blocksInternalAndUnlistedTargets() throws Exception {
        String auth = "Bearer " + registerAndGetToken(mvc, uniqueEmail());
        for (String url : new String[]{
                "http://localhost:8080/api/dashboard",
                "https://localhost/",
                "https://127.0.0.1/",
                "https://169.254.169.254/latest/meta-data/",
                "https://10.0.0.1/",
                "http://api.openai.com/v1/models",
                "https://evil.example.com/steal"}) {
            mvc.perform(post("/api/tester/execute").header("Authorization", auth)
                            .contentType("application/json").content(body("openai", "GET", url)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").exists());
        }
    }

    @Test
    void validatesMethodAndApiId() throws Exception {
        String auth = "Bearer " + registerAndGetToken(mvc, uniqueEmail());
        mvc.perform(post("/api/tester/execute").header("Authorization", auth).contentType("application/json")
                        .content(body("openai", "TRACE", "https://api.openai.com/v1/models")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/tester/execute").header("Authorization", auth).contentType("application/json")
                        .content(body("no-such-api", "GET", "https://api.openai.com/v1/models")))
                .andExpect(status().isNotFound());
    }

    @Test
    void refusesDangerousHeaders() throws Exception {
        String auth = "Bearer " + registerAndGetToken(mvc, uniqueEmail());
        String json = MAPPER.writeValueAsString(Map.of(
                "apiId", "github", "method", "GET", "url", "https://api.github.com/zen",
                "headers", Map.of("Host", "internal.local")));
        mvc.perform(post("/api/tester/execute").header("Authorization", auth)
                        .contentType("application/json").content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("The header 'Host' cannot be set"));
    }
}
