package com.escapsule.thalitera.utils;

import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;

public class IpUtils {
    /**
     * Get the client IP address.
     * <p>
     * The method aims to penetrate multiple layers of proxies to obtain the real client IP address.
     * It first tries to get the IP through common proxy headers. If these headers do not exist or are unknown values,
     * it falls back to getting the remote address directly from the request.
     *
     * @param request HTTP request object, which is used to obtain header information and remote addresses.
     * @return If the real IP address of the client cannot be determined, it may return the IP address of the proxy server.
     */
    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (StringUtils.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (StringUtils.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (StringUtils.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // In the case of multi-level proxies, take the first non-unknown IP
        if (StringUtils.isNotBlank(ip) && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
