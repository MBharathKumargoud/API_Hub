package com.apihub.service;

import com.apihub.exception.BadRequestException;
import com.apihub.repository.ApiRepository;
import com.apihub.util.NetworkUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * SSRF protection for the API tester. A URL is accepted only if ALL of these are true:
 *  1. it is https, has no user:password@ part and uses the default port (443)
 *  2. its host is exactly the host of one of the APIs in our directory (the allow-list)
 *  3. every IP address that host resolves to is a public address
 *     (not localhost, private ranges, link-local/cloud-metadata, etc.)
 */
@Component
public class OutboundUrlValidator {

    private final Supplier<Set<String>> allowedHosts;
    private final Function<String, InetAddress[]> resolver;

    @Autowired
    public OutboundUrlValidator(ApiRepository apiRepository) {
        this(() -> hostsFromBaseUrls(apiRepository), OutboundUrlValidator::dnsLookup);
    }

    /** Used by unit tests to supply a fake allow-list and fake DNS. */
    public OutboundUrlValidator(Supplier<Set<String>> allowedHosts, Function<String, InetAddress[]> resolver) {
        this.allowedHosts = allowedHosts;
        this.resolver = resolver;
    }

    public URI validate(String url) {
        URI uri;
        try {
            uri = new URI(url.trim());
        } catch (URISyntaxException e) {
            throw new BadRequestException("The URL is not valid");
        }
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new BadRequestException("Only https:// URLs are allowed");
        }
        if (uri.getRawUserInfo() != null) {
            throw new BadRequestException("URLs with a username or password are not allowed");
        }
        if (uri.getPort() != -1 && uri.getPort() != 443) {
            throw new BadRequestException("Only the default HTTPS port (443) is allowed");
        }
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new BadRequestException("The URL must contain a host name");
        }
        if (!allowedHosts.get().contains(host.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("This host is not an API listed in API Hub, so it cannot be tested here");
        }
        InetAddress[] addresses;
        try {
            addresses = resolver.apply(host);
        } catch (RuntimeException e) {
            throw new BadRequestException("The host name could not be resolved");
        }
        if (addresses == null || addresses.length == 0) {
            throw new BadRequestException("The host name could not be resolved");
        }
        for (InetAddress address : addresses) {
            if (NetworkUtils.isBlockedAddress(address)) {
                throw new BadRequestException("Requests to internal or private network addresses are not allowed");
            }
        }
        return uri;
    }

    static Set<String> hostsFromBaseUrls(ApiRepository repository) {
        Set<String> hosts = new HashSet<>();
        for (String baseUrl : repository.findAllBaseUrls()) {
            try {
                String host = new URI(baseUrl).getHost();
                // skip placeholder entries such as https://{shop}.myshopify.com or your-store.example
                if (host != null && !host.endsWith(".example")) {
                    hosts.add(host.toLowerCase(Locale.ROOT));
                }
            } catch (URISyntaxException ignored) {
                // template URLs like https://{shop}.myshopify.com are not valid URIs: not testable
            }
        }
        return hosts;
    }

    private static InetAddress[] dnsLookup(String host) {
        try {
            return InetAddress.getAllByName(host);
        } catch (UnknownHostException e) {
            throw new IllegalStateException("unresolvable host");
        }
    }
}
