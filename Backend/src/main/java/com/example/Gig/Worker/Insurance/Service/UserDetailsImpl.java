package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.Model.User;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private String role;

    // ✅ Constructor
    public UserDetailsImpl(Long id, String email, String password, String role) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // ✅ Build method — OAuth users have null password; use empty string so Spring Security doesn't NPE
    public static UserDetailsImpl build(User user) {
        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getPassword() != null ? user.getPassword() : "",   // safe for OAuth users
                user.getRole().name()
        );
    }

    // 🔥 FIXED METHOD (VERY IMPORTANT)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        // 🔴 Handle null safety
        String safeRole = (role == null) ? "WORKER" : role;

        // 🔴 Fix ROLE duplication issue
        String finalRole = safeRole.startsWith("ROLE_")
                ? safeRole
                : "ROLE_" + safeRole;

        return List.of(new SimpleGrantedAuthority(finalRole));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    // ✅ Optional getters
    public Long getId() {
        return id;
    }

    public String getRole() {
        return role;
    }

    // 🔐 Account status
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}