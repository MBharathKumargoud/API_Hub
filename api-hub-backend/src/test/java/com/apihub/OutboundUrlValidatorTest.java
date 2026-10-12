package com.apihub;

import com.apihub.exception.BadRequestException;
import com.apihub.service.OutboundUrlValidator;
import com.apihub.util.NetworkUtils;
import org.junit.jupiter.api.Test;

import java.net.InetAddress;
import java.net.URI;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/** Pure unit tests: a fake allow-list and fake DNS, so no network is needed. */
class OutboundUrlValidatorTest {

    private static InetAddress ip(int a, int b, int c, int d) throws Exception {
        return InetAddress.getByAddress(new byte[]{(byte) a, (byte) b, (byte) c, (byte) d});
    }

    private OutboundUrlValidator validator() throws Exception {
        Map<String, InetAddress[]> dns = Map.of(
                "api.github.com", new InetAddress[]{ip(140, 82, 112, 5)},
                "rebind.example.org", new InetAddress[]{ip(127, 0, 0, 1)},
                "meta.example.org", new InetAddress[]{ip(169, 254, 169, 254)});
        Set<String> allowed = Set.of("api.github.com", "rebind.example.org", "meta.example.org");
        return new OutboundUrlValidator(() -> allowed, host -> {
            InetAddress[] r = dns.get(host);
            if (r == null) throw new IllegalStateException("no such host");
            return r;
        });
    }

    @Test
    void acceptsAllowListedPublicHttpsUrl() throws Exception {
        URI uri = validator().validate("https://api.github.com/users/octocat?x=1");
        assertEquals("api.github.com", uri.getHost());
    }

    @Test
    void rejectsLocalhostAndLiteralIps() throws Exception {
        OutboundUrlValidator v = validator();
        for (String url : new String[]{
                "https://localhost/admin", "https://127.0.0.1/", "https://[::1]/",
                "https://169.254.169.254/latest/meta-data/", "https://10.0.0.5/", "https://192.168.1.1/",
                "https://172.16.0.1/", "https://0.0.0.0/"}) {
            assertThrows(BadRequestException.class, () -> v.validate(url), url);
        }
    }

    @Test
    void rejectsNonHttpsSchemes() throws Exception {
        OutboundUrlValidator v = validator();
        for (String url : new String[]{"http://api.github.com/", "ftp://api.github.com/", "file:///etc/passwd",
                "gopher://api.github.com/"}) {
            assertThrows(BadRequestException.class, () -> v.validate(url), url);
        }
    }

    @Test
    void rejectsUnlistedHostsUserInfoAndOddPorts() throws Exception {
        OutboundUrlValidator v = validator();
        assertThrows(BadRequestException.class, () -> v.validate("https://evil.example.com/"));
        assertThrows(BadRequestException.class, () -> v.validate("https://api.github.com.evil.com/"));
        assertThrows(BadRequestException.class, () -> v.validate("https://user:pw@api.github.com/"));
        assertThrows(BadRequestException.class, () -> v.validate("https://api.github.com:8443/"));
        assertThrows(BadRequestException.class, () -> v.validate("not a url"));
    }

    @Test
    void rejectsAllowListedHostThatResolvesToInternalAddress() throws Exception {
        OutboundUrlValidator v = validator();
        assertThrows(BadRequestException.class, () -> v.validate("https://rebind.example.org/"));
        assertThrows(BadRequestException.class, () -> v.validate("https://meta.example.org/"));
    }

    @Test
    void networkUtilsClassifiesAddresses() throws Exception {
        assertTrue(NetworkUtils.isBlockedAddress(ip(127, 0, 0, 1)));
        assertTrue(NetworkUtils.isBlockedAddress(ip(10, 1, 2, 3)));
        assertTrue(NetworkUtils.isBlockedAddress(ip(172, 20, 0, 1)));
        assertTrue(NetworkUtils.isBlockedAddress(ip(192, 168, 0, 1)));
        assertTrue(NetworkUtils.isBlockedAddress(ip(169, 254, 169, 254)));
        assertTrue(NetworkUtils.isBlockedAddress(ip(100, 64, 0, 1)));
        assertTrue(NetworkUtils.isBlockedAddress(InetAddress.getByName("fd00::1")));
        assertTrue(NetworkUtils.isBlockedAddress(InetAddress.getByName("::1")));
        assertFalse(NetworkUtils.isBlockedAddress(ip(8, 8, 8, 8)));
        assertFalse(NetworkUtils.isBlockedAddress(ip(140, 82, 112, 5)));
    }
}
