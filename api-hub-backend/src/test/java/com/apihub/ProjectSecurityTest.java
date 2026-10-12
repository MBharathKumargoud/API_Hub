package com.apihub;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static com.apihub.TestSupport.*;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectSecurityTest {

    @Autowired
    MockMvc mvc;

    private long createProject(String token, String name) throws Exception {
        String body = MAPPER.writeValueAsString(Map.of("name", name, "description", "demo"));
        String response = mvc.perform(post("/api/projects").header("Authorization", "Bearer " + token)
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode node = MAPPER.readTree(response);
        return node.get("id").asLong();
    }

    @Test
    void ownerCanReadUpdateAndDeleteOwnProject() throws Exception {
        String token = registerAndGetToken(mvc, uniqueEmail());
        String auth = "Bearer " + token;
        long id = createProject(token, "My project");

        mvc.perform(get("/api/projects/" + id).header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("My project"));
        mvc.perform(put("/api/projects/" + id).header("Authorization", auth).contentType("application/json")
                        .content(MAPPER.writeValueAsString(Map.of("name", "Renamed"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Renamed"));
        mvc.perform(delete("/api/projects/" + id).header("Authorization", auth))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/projects/" + id).header("Authorization", auth))
                .andExpect(status().isNotFound());
    }

    @Test
    void anotherUserCannotSeeChangeOrDeleteMyProject() throws Exception {
        String owner = registerAndGetToken(mvc, uniqueEmail());
        String intruder = registerAndGetToken(mvc, uniqueEmail());
        String intruderAuth = "Bearer " + intruder;
        long id = createProject(owner, "Private project");

        mvc.perform(get("/api/projects/" + id).header("Authorization", intruderAuth))
                .andExpect(status().isNotFound());
        mvc.perform(put("/api/projects/" + id).header("Authorization", intruderAuth)
                        .contentType("application/json")
                        .content(MAPPER.writeValueAsString(Map.of("name", "Hacked"))))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/projects/" + id).header("Authorization", intruderAuth))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/projects").header("Authorization", intruderAuth))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));

        // the owner still has it, unchanged
        mvc.perform(get("/api/projects/" + id).header("Authorization", "Bearer " + owner))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Private project"));
    }

    @Test
    void projectNameIsValidated() throws Exception {
        String token = registerAndGetToken(mvc, uniqueEmail());
        mvc.perform(post("/api/projects").header("Authorization", "Bearer " + token)
                        .contentType("application/json").content("{\"name\":\"  \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }
}
