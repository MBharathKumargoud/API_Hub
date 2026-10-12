package com.apihub;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static com.apihub.TestSupport.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthTest {

    @Autowired
    MockMvc mvc;

    private String json(Map<String, String> map) throws Exception {
        return MAPPER.writeValueAsString(map);
    }

    @Test
    void registerCreatesUserAndNeverReturnsPassword() throws Exception {
        String email = uniqueEmail();
        mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content(json(Map.of("name", "Asha", "email", email, "password", "Passw0rd123"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    void duplicateEmailIsRejectedWith409() throws Exception {
        String email = uniqueEmail();
        registerAndGetToken(mvc, email);
        mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content(json(Map.of("name", "Again", "email", email.toUpperCase(), "password", "Passw0rd123"))))
                .andExpect(status().isConflict());
    }

    @Test
    void invalidRegistrationReturns400WithFieldErrors() throws Exception {
        mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content(json(Map.of("name", "", "email", "not-an-email", "password", "short"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test
    void loginSucceedsWithCorrectPassword() throws Exception {
        String email = uniqueEmail();
        registerAndGetToken(mvc, email);
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content(json(Map.of("email", email, "password", "Passw0rd123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(email));
    }

    @Test
    void loginFailsWithWrongPasswordOrUnknownEmail() throws Exception {
        String email = uniqueEmail();
        registerAndGetToken(mvc, email);
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content(json(Map.of("email", email, "password", "WrongPassword1"))))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content(json(Map.of("email", uniqueEmail(), "password", "Passw0rd123"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meRequiresAValidToken() throws Exception {
        String email = uniqueEmail();
        String token = registerAndGetToken(mvc, email);

        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer not.a.token"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void privateEndpointsRejectAnonymousUsers() throws Exception {
        mvc.perform(get("/api/dashboard")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/projects")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/saved-apis")).andExpect(status().isUnauthorized());
    }

    @Test
    void savedApisAndDashboardUseRealData() throws Exception {
        String token = registerAndGetToken(mvc, uniqueEmail());
        String auth = "Bearer " + token;
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/saved-apis/openai")
                        .header("Authorization", auth))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/saved-apis").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", contains("openai")));
        mvc.perform(get("/api/dashboard").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalApis").value(50))
                .andExpect(jsonPath("$.savedApis").value(1))
                .andExpect(jsonPath("$.projects").value(0));
    }
}
