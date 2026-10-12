package com.apihub.controller;

import com.apihub.dto.TesterRequest;
import com.apihub.dto.TesterResponse;
import com.apihub.service.ApiTesterService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tester")
public class TesterController {

    private final ApiTesterService testerService;

    public TesterController(ApiTesterService testerService) {
        this.testerService = testerService;
    }

    @PostMapping("/execute")
    public TesterResponse execute(@Valid @RequestBody TesterRequest request, Authentication authentication) {
        return testerService.execute(authentication.getName(), request);
    }
}
