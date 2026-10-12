package com.apihub.exception;

/** The API provider could not be reached or answered badly (HTTP 502, or 504 for timeouts). */
public class UpstreamException extends RuntimeException {
    private final boolean timeout;

    public UpstreamException(String message, boolean timeout) {
        super(message);
        this.timeout = timeout;
    }

    public boolean isTimeout() {
        return timeout;
    }
}
