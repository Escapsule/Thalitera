package com.escapsule.thalitera.interceptor;

import com.escapsule.thalitera.adapter.InstantTypeAdapter;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.response.ApiResult;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;

public class AuthInterceptor implements HandlerInterceptor {

    private static final Gson GSON = new GsonBuilder()
            .registerTypeAdapter(Instant.class, new InstantTypeAdapter())
            .create();
    /**
     * Intercept all requests and check whether the user is logged in
     *
     * @param request  HttpServletRequest
     * @param response HttpServletResponse
     * @param handler  Object
     * @return true: continue processing, false: stop processing
     * @throws Exception Exception
     */
    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        // 1. Check whether it is a public interface (e.g. login, registration)
        if (isPublicEndpoint(request)) {
            // release open interface
            return true;
        }

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // 2. Check if the user is logged in
        HttpSession session = request.getSession(false);
        // Does not automatically create a new session
        if (session == null || session.getAttribute("user") == null) {
            // 3. Unlogged-in users access protected interfaces, denied access
            sendUnauthorizedError(response);
            return false;
        }

        User user = (User) session.getAttribute("user");
        if (!hasPermission(
                user.getStatus(),
                request.getRequestURI())
        ) {
            sendForbiddenError(response);
            return false;
        }

        // intercept request
        return true;
    }

    /**
     * Determine whether the current request is a public interface
     *
     * @param request HttpServletRequest
     * @return true: public interface, false: protected interface
     */
    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/user/login") ||
               path.startsWith("/user/register") ||
               path.startsWith("/public/");
    }

    /**
     * Send unauthorized error response
     *
     * @param response HttpServletResponse
     * @throws Exception Exception
     */
    private void sendUnauthorizedError(HttpServletResponse response) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(
                GSON.toJson(
                        ApiResult.error(
                                ErrorCode.USER_NOT_LOGIN.getCode(),
                                ErrorCode.USER_NOT_LOGIN.getMessage())));
    }

    /**
     * Send forbidden error response
     *
     * @param response HttpServletResponse
     * @throws Exception Exception
     */
    private void sendForbiddenError(HttpServletResponse response) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.getWriter().write(
                GSON.toJson(
                        ApiResult.error(
                                ErrorCode.PERMISSION_DENIED.getCode(),
                                ErrorCode.PERMISSION_DENIED.getMessage())));
    }

    /**
     * Determine whether the current user has permission to access the current interface
     *
     * @param role  User role
     * @param path  Request path
     * @return true: has permission, false: no permission
     */
    private boolean hasPermission(String role, String path) {
        // Admin can access all interfaces starting with /admin/.
        if ("admin".equals(role) && path.startsWith("/admin/")) {
            return true;
            // Users can only access interfaces starting with /user/ (excluding the public interfaces that have been released).
        } else if ("active".equals(role) && path.startsWith("/user/")) {
            return true;
        }
        return false;
    }
}
