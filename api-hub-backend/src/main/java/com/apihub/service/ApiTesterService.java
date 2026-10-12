package com.apihub.service;

import com.apihub.dto.TesterRequest;
import com.apihub.dto.TesterResponse;
import com.apihub.entity.Api;
import com.apihub.entity.ApiRequestHistory;
import com.apihub.entity.User;
import com.apihub.exception.BadRequestException;
import com.apihub.exception.UpstreamException;
import com.apihub.repository.ApiRequestHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Sends the user's test request to the API provider and returns the answer.
 * Safety rules: validated allow-listed https URL only, no redirects, timeouts,
 * response size limit, dangerous headers refused, nothing secret is logged or stored.
 */
@Service
public class ApiTesterService {

    private static final Logger log = LoggerFactory.getLogger(ApiTesterService.class);

    private static final Pattern HEADER_NAME = Pattern.compile("^[A-Za-z0-9-]{1,64}$");
    private static final Set<String> FORBIDDEN_HEADERS = Set.of(
            "host", "content-length", "connection", "keep-alive", "transfer-encoding", "upgrade",
            "te", "trailer", "expect", "cookie", "accept-encoding", "proxy-authorization", "proxy-connection");
    private static final Set<String> HIDDEN_RESPONSE_HEADERS = Set.of("set-cookie", "set-cookie2");

    private final ApiService apiService;
    private final AuthService authService;
    private final OutboundUrlValidator urlValidator;
    private final ApiRequestHistoryRepository historyRepository;
    private final HttpClient httpClient;
    private final Duration requestTimeout;
    private final int maxResponseBytes;

    public ApiTesterService(ApiService apiService, AuthService authService, OutboundUrlValidator urlValidator,
                            ApiRequestHistoryRepository historyRepository,
                            @Value("${app.tester.connect-timeout-seconds}") long connectTimeoutSeconds,
                            @Value("${app.tester.request-timeout-seconds}") long requestTimeoutSeconds,
                            @Value("${app.tester.max-response-bytes}") int maxResponseBytes) {
        this.apiService = apiService;
        this.authService = authService;
        this.urlValidator = urlValidator;
        this.historyRepository = historyRepository;
        this.requestTimeout = Duration.ofSeconds(requestTimeoutSeconds);
        this.maxResponseBytes = maxResponseBytes;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(connectTimeoutSeconds))
                .followRedirects(HttpClient.Redirect.NEVER) // a redirect could point at an internal address
                .build();
    }

    public TesterResponse execute(String email, TesterRequest request) {
        User user = authService.getByEmail(email);
        Api api = apiService.findEntity(request.apiId());
        String method = request.method().toUpperCase(Locale.ROOT);

        Map<String, String> headers = validateHeaders(request.headers()); // cheap checks first, no network
        URI uri = urlValidator.validate(withQueryParams(request.url(), request.queryParams()));
        HttpRequest httpRequest = buildRequest(uri, method, headers, request);

        long started = System.nanoTime();
        try {
            HttpResponse<InputStream> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofInputStream());
            byte[] data;
            try (InputStream in = response.body()) {
                data = in.readNBytes(maxResponseBytes + 1);
            }
            boolean truncated = data.length > maxResponseBytes;
            String body = new String(data, 0, Math.min(data.length, maxResponseBytes), StandardCharsets.UTF_8);
            long duration = elapsedMillis(started);

            log.info("Tester: {} {} -> {} in {} ms", method, uri.getHost(), response.statusCode(), duration);
            recordHistory(user, api, method, uri, response.statusCode(), duration);
            return new TesterResponse(response.statusCode(), reason(response.statusCode()), duration,
                    visibleHeaders(response), body, truncated);
        } catch (HttpTimeoutException e) {
            recordHistory(user, api, method, uri, null, elapsedMillis(started));
            throw new UpstreamException("The API provider did not respond in time", true);
        } catch (IOException e) {
            recordHistory(user, api, method, uri, null, elapsedMillis(started));
            throw new UpstreamException("Could not reach the API provider", false);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new UpstreamException("The request was interrupted", false);
        }
    }

    // ---------------------------------------------------------------- helpers

    /** Checks every header the user typed and returns a clean copy. */
    private static Map<String, String> validateHeaders(Map<String, String> input) {
        Map<String, String> clean = new LinkedHashMap<>();
        if (input == null) {
            return clean;
        }
        for (Map.Entry<String, String> h : input.entrySet()) {
            String name = h.getKey() == null ? "" : h.getKey().trim();
            String value = h.getValue() == null ? "" : h.getValue();
            if (!HEADER_NAME.matcher(name).matches()) {
                throw new BadRequestException("Invalid header name: " + abbreviate(name));
            }
            String lower = name.toLowerCase(Locale.ROOT);
            if (FORBIDDEN_HEADERS.contains(lower) || lower.startsWith("proxy-")) {
                throw new BadRequestException("The header '" + name + "' cannot be set");
            }
            if (value.length() > 4096 || value.contains("\r") || value.contains("\n")) {
                throw new BadRequestException("Invalid value for header '" + name + "'");
            }
            clean.put(name, value);
        }
        return clean;
    }

    private HttpRequest buildRequest(URI uri, String method, Map<String, String> headers, TesterRequest request) {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri).timeout(requestTimeout);
        boolean hasContentType = false;
        for (Map.Entry<String, String> h : headers.entrySet()) {
            if (h.getKey().equalsIgnoreCase("content-type")) {
                hasContentType = true;
            }
            builder.header(h.getKey(), h.getValue());
        }

        boolean sendsBody = request.body() != null && !request.body().isBlank()
                && (method.equals("POST") || method.equals("PUT") || method.equals("PATCH"));
        if (sendsBody) {
            if (!hasContentType) {
                builder.header("Content-Type", "application/json");
            }
            builder.method(method, HttpRequest.BodyPublishers.ofString(request.body()));
        } else {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        }
        return builder.build();
    }

    /** Appends ?key=value pairs (URL-encoded) to the URL. */
    private static String withQueryParams(String url, Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return url;
        }
        StringBuilder sb = new StringBuilder(url.trim());
        char separator = url.contains("?") ? '&' : '?';
        for (Map.Entry<String, String> p : params.entrySet()) {
            if (p.getKey() == null || p.getKey().isBlank()) {
                throw new BadRequestException("Query parameter names cannot be empty");
            }
            sb.append(separator)
                    .append(URLEncoder.encode(p.getKey().trim(), StandardCharsets.UTF_8))
                    .append('=')
                    .append(URLEncoder.encode(p.getValue() == null ? "" : p.getValue(), StandardCharsets.UTF_8));
            separator = '&';
        }
        return sb.toString();
    }

    private static Map<String, String> visibleHeaders(HttpResponse<?> response) {
        Map<String, String> out = new LinkedHashMap<>();
        response.headers().map().forEach((name, values) -> {
            if (!HIDDEN_RESPONSE_HEADERS.contains(name.toLowerCase(Locale.ROOT)) && !values.isEmpty()) {
                out.put(name.toLowerCase(Locale.ROOT), String.join(", ", values));
            }
        });
        return out;
    }

    /** Stores method + host + path only. The query string is dropped because it may hold an API key. */
    private void recordHistory(User user, Api api, String method, URI uri, Integer status, long durationMs) {
        try {
            String path = uri.getRawPath() == null ? "" : uri.getRawPath();
            String endpoint = abbreviate(uri.getScheme() + "://" + uri.getHost() + path, 500);
            ApiRequestHistory h = new ApiRequestHistory();
            h.setUser(user);
            h.setApi(api);
            h.setHttpMethod(method);
            h.setEndpoint(endpoint);
            h.setStatusCode(status);
            h.setDurationMs(durationMs);
            historyRepository.save(h);
        } catch (RuntimeException e) {
            log.warn("Could not save request history", e); // history must never break the actual test
        }
    }

    private static String reason(int status) {
        HttpStatus s = HttpStatus.resolve(status);
        return s == null ? "" : s.getReasonPhrase();
    }

    private static long elapsedMillis(long startedNanos) {
        return (System.nanoTime() - startedNanos) / 1_000_000;
    }

    private static String abbreviate(String s) {
        return abbreviate(s, 40);
    }

    private static String abbreviate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }
}
