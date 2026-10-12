package com.apihub;

import com.apihub.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import static com.apihub.TestSupport.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(PasswordResetTest.CapturingMailConfig.class)
class PasswordResetTest {

    /** Replaces the SMTP sender so the test can read the OTP. */
    static class CapturingEmailService implements EmailService {
        final CopyOnWriteArrayList<String[]> sent = new CopyOnWriteArrayList<>(); // {toEmail, otp}

        @Override
        public void sendPasswordResetOtp(String toEmail, String userName, String otp) {
            sent.add(new String[]{toEmail, otp});
        }

        String otpFor(String email) {
            return sent.stream().filter(s -> s[0].equals(email)).map(s -> s[1]).reduce((a, b) -> b).orElse(null);
        }
    }

    @TestConfiguration
    static class CapturingMailConfig {
        @Bean
        @Primary
        CapturingEmailService capturingEmailService() {
            return new CapturingEmailService();
        }
    }

    @Autowired
    MockMvc mvc;
    @Autowired
    CapturingEmailService mail;

    private void forgot(String email) throws Exception {
        mvc.perform(post("/api/auth/forgot-password").contentType("application/json")
                        .content(MAPPER.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    private int reset(String email, String otp, String password) throws Exception {
        return mvc.perform(post("/api/auth/reset-password").contentType("application/json")
                        .content(MAPPER.writeValueAsString(Map.of("email", email, "otp", otp, "newPassword", password))))
                .andReturn().getResponse().getStatus();
    }

    private int login(String email, String password) throws Exception {
        return mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content(MAPPER.writeValueAsString(Map.of("email", email, "password", password))))
                .andReturn().getResponse().getStatus();
    }

    @Test
    void unknownEmailGetsSameAnswerAndNoOtpIsSent() throws Exception {
        String email = uniqueEmail();
        forgot(email);
        assertNull(mail.otpFor(email));
        assertEquals(400, reset(email, "123456", "NewPassw0rd9")); // same generic failure, no enumeration
    }

    @Test
    void fullFlowChangesThePasswordAndOtpWorksOnlyOnce() throws Exception {
        String email = uniqueEmail();
        registerAndGetToken(mvc, email);

        forgot(email);
        String otp = mail.otpFor(email);
        assertNotNull(otp);
        assertTrue(otp.matches("\\d{6}"));

        assertEquals(200, reset(email, otp, "NewPassw0rd9"));
        assertEquals(200, login(email, "NewPassw0rd9"));
        assertEquals(401, login(email, "Passw0rd123"));        // old password no longer works
        assertEquals(400, reset(email, otp, "AnotherPass1"));  // OTP cannot be reused
    }

    @Test
    void wrongOtpIsRejectedAndLocksAfterFiveAttempts() throws Exception {
        String email = uniqueEmail();
        registerAndGetToken(mvc, email);
        forgot(email);
        String otp = mail.otpFor(email);
        String wrong = otp.equals("000000") ? "111111" : "000000";

        for (int i = 0; i < 5; i++) {
            assertEquals(400, reset(email, wrong, "NewPassw0rd9"));
        }
        assertEquals(400, reset(email, otp, "NewPassw0rd9"));  // correct code is now dead too
        assertEquals(200, login(email, "Passw0rd123"));        // password never changed
    }

    @Test
    void weakPasswordAndBadOtpFormatAreRejectedWithoutUsingTheOtp() throws Exception {
        String email = uniqueEmail();
        registerAndGetToken(mvc, email);
        forgot(email);
        String otp = mail.otpFor(email);

        assertEquals(400, reset(email, otp, "short"));          // fails validation
        assertEquals(400, reset(email, "12ab", "GoodPassw0rd")); // OTP must be 6 digits
        assertEquals(200, reset(email, otp, "GoodPassw0rd"));    // the real OTP still works
    }
}
