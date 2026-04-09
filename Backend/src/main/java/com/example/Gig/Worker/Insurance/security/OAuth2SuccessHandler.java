package com.example.Gig.Worker.Insurance.security;

import com.example.Gig.Worker.Insurance.Model.AppRole;
import com.example.Gig.Worker.Insurance.Model.User;
import com.example.Gig.Worker.Insurance.Repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

/**
 * Called by Spring Security after successful Google OAuth2 login.
 * - Creates a new User in the DB if first sign-in
 * - Generates a short-lived scoped JWT (15 min) for OTP phase
 * - Redirects frontend to /verify-otp?token=<scoped_jwt>
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email   = oAuth2User.getAttribute("email");
        String name    = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        if (email == null) {
            response.sendRedirect(frontendUrl + "/signup?error=google_no_email");
            return;
        }

        Optional<User> existing = userRepository.findByEmail(email.toLowerCase());
        User user;

        if (existing.isPresent()) {
            // Returning user — update picture in case it changed
            user = existing.get();
            user.setProfilePicture(picture);
            userRepository.save(user);
        } else {
            // New user — save minimal record; phone collected at OTP stage
            user = new User();
            user.setEmail(email.toLowerCase());
            user.setName(name != null ? name : email.split("@")[0]);
            user.setUsername(email.split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", ""));
            user.setPassword(java.util.UUID.randomUUID().toString()); // Placeholder password because DB might enforce NOT NULL
            user.setPhoneNumber("PENDING");  // Placeholder phone number as DB might enforce NOT NULL
            user.setRole(AppRole.WORKER);
            user.setProvider("GOOGLE");
            user.setIsVerified(false);
            user.setProfilePicture(picture);
            user.setIsLoggedIn(false);
            userRepository.save(user);
        }

        // Scoped JWT — valid 15 minutes, only usable for OTP endpoints
        String scopedToken = jwtUtil.generateScopedToken(email.toLowerCase(), "OTP_VERIFICATION_ONLY", 15);

        // Redirect frontend to the OTP verification page
        getRedirectStrategy().sendRedirect(
            request, response,
            frontendUrl + "/verify-otp?token=" + scopedToken
        );
    }
}
