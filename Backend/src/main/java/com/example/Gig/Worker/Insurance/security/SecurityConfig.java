package com.example.Gig.Worker.Insurance.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          CustomOAuth2UserService customOAuth2UserService,
                          OAuth2SuccessHandler oAuth2SuccessHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ❌ Disable CSRF (required for REST + JWT)
                .csrf(csrf -> csrf.disable())

                // ✅ Enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ✅ Stateless session for REST; OAuth2 needs session temporarily, so we don't force STATELESS globally
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )

                // 🔐 Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // Public pre-flight & auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // OAuth2 endpoints — Spring Security auto-handles these
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()

                        // OTP verification endpoints — accessible with scoped JWT (bearer header)
                        .requestMatchers("/api/v1/auth/otp/**").permitAll()

                        // Public APIs
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/policy-templates").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/workers").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/workers").permitAll()

                        // 🤖 AI Orchestration Layer — fully public (no auth required for demo/testing)
                        .requestMatchers("/api/ai/**").permitAll()

                        // 🧪 Test endpoints
                        .requestMatchers("/api/test/**").permitAll()

                        // Role-based APIs
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/workers/**").hasRole("WORKER")

                        // Shared secured APIs
                        .requestMatchers("/policies/**").authenticated()

                        // Everything else requires auth
                        .anyRequest().authenticated()
                )

                // ❗ Unauthorized handler for REST routes
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, ex1) -> {
                            if (!response.isCommitted()) {
                                response.setStatus(401);
                                response.setContentType("application/json");
                                response.getWriter().write("{\"error\":\"Unauthorized\"}");
                            }
                        })
                )

                // 🔥 Google OAuth2 Login
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(ep -> ep.baseUri("/oauth2/authorization"))
                        .redirectionEndpoint(ep -> ep.baseUri("/login/oauth2/code/*"))
                        .userInfoEndpoint(ui -> ui.userService(customOAuth2UserService))
                        .successHandler(oAuth2SuccessHandler)
                        .failureUrl("http://localhost:5173/signup?error=oauth_failed")
                )

                // 🔥 JWT Filter (runs for REST endpoints)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 🔐 Authentication Manager
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // 🌐 CORS CONFIG
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173")); // ✅ Frontend
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // 🔥 Required for cookies

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // 🔐 Password Encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}