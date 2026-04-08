package com.example.Gig.Worker.Insurance.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // 🔴 CHANGED
import org.springframework.security.core.userdetails.UserDetailsService; // 🔴 CHANGED

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // 🔴 CHANGED: Added UserDetailsService
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtUtil jwtUtil,
                         UserDetailsService userDetailsService) { // 🔴 CHANGED
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService; // 🔴 CHANGED
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // ✅ Skip auth endpoints
        if (path.startsWith("/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;

        // ✅ Extract token from cookies (same as your logic)
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                }
            }
        }

        // 🔴 CHANGED: Proper Spring Security flow
        if (token != null && jwtUtil.validateToken(token)) {

            String email = jwtUtil.extractUsername(token); // (same method)

            // 🔴 CHANGED: Load full user details
            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(email);

            // 🔴 CHANGED: Attach authorities instead of empty list
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}