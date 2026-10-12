package com.apihub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Small helpers shared by the tests. */
final class TestSupport {

    static final ObjectMapper MAPPER = new ObjectMapper();

    private TestSupport() {
    }

    static String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@example.com";
    }

    /** Registers a new user and returns the JWT. */
    static String registerAndGetToken(MockMvc mvc, String email) throws Exception {
        String json = MAPPER.writeValueAsString(Map.of("name", "Test User", "email", email, "password", "Passw0rd123"));
        MvcResult result = mvc.perform(post("/api/auth/register")
                        .contentType("application/json").content(json))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode node = MAPPER.readTree(result.getResponse().getContentAsString());
        return node.get("token").asText();
    }
}
