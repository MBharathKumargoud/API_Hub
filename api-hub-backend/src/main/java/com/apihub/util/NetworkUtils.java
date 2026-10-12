package com.apihub.util;

import java.net.Inet4Address;
import java.net.InetAddress;

/** Helpers for deciding whether an IP address is safe to connect to (SSRF protection). */
public final class NetworkUtils {

    private NetworkUtils() {
    }

    /** True for loopback, private, link-local (incl. cloud metadata 169.254.169.254), multicast, etc. */
    public static boolean isBlockedAddress(InetAddress address) {
        if (address.isAnyLocalAddress() || address.isLoopbackAddress() || address.isLinkLocalAddress()
                || address.isSiteLocalAddress() || address.isMulticastAddress()) {
            return true;
        }
        byte[] b = address.getAddress();
        if (address instanceof Inet4Address) {
            int first = b[0] & 0xFF;
            int second = b[1] & 0xFF;
            if (first == 0) return true;                                   // 0.0.0.0/8
            if (first == 100 && second >= 64 && second <= 127) return true; // 100.64.0.0/10 (carrier-grade NAT)
            if (first == 192 && second == 0 && (b[2] & 0xFF) == 0) return true; // 192.0.0.0/24
            if (first == 198 && (second == 18 || second == 19)) return true; // 198.18.0.0/15 (benchmarking)
            return first >= 240;                                           // reserved + broadcast
        }
        // IPv6 unique-local addresses fc00::/7
        return (b[0] & 0xFE) == 0xFC;
    }
}
