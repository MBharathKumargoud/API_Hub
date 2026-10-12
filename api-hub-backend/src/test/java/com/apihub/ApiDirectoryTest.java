package com.apihub;

import com.apihub.repository.ApiRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiDirectoryTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    ApiRepository apiRepository;

    @Test
    void seederInsertedAll50Apis() {
        assertEquals(50, apiRepository.count());
    }

    @Test
    void listReturnsAll50ApisWithoutLogin() throws Exception {
        mvc.perform(get("/api/apis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(50)))
                .andExpect(jsonPath("$[0].id").value("openai"))
                .andExpect(jsonPath("$[0].documentation").exists())
                .andExpect(jsonPath("$[0].freeTier").exists());
    }

    @Test
    void searchFindsWeatherApis() throws Exception {
        mvc.perform(get("/api/apis").param("query", "weather"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[*].id", hasItem("openweather")));
    }

    @Test
    void filterByCategoryReturnsOnlyThatCategory() throws Exception {
        mvc.perform(get("/api/apis").param("category", "Payment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)))
                .andExpect(jsonPath("$[*].category", everyItem(is("Payment"))));
    }

    @Test
    void categoriesAndProvidersAreListed() throws Exception {
        mvc.perform(get("/api/apis/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(9)))
                .andExpect(jsonPath("$", hasItem("AI / ML")));
        mvc.perform(get("/api/apis/providers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasItem("OpenAI")));
    }

    @Test
    void getByIdReturnsOneApi() throws Exception {
        mvc.perform(get("/api/apis/openai"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("openai"))
                .andExpect(jsonPath("$.name").value("OpenAI API"))
                .andExpect(jsonPath("$.category").value("AI / ML"))
                .andExpect(jsonPath("$.authentication").value("API Key"))
                .andExpect(jsonPath("$.baseUrl").value("https://api.openai.com/v1"));
    }

    @Test
    void unknownApiReturns404Json() throws Exception {
        mvc.perform(get("/api/apis/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").exists());
    }
}
