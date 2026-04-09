package com.example.Gig.Worker.Insurance.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "username")
                // phone_number intentionally excluded — OAuth users start with null
        }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ FULL NAME
    @Column(nullable = false)
    private String name;

    // ✅ USERNAME (for login/display)
    @Column(nullable = false)
    private String username;

    // ✅ EMAIL
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false)
    private String email;

    // ✅ PASSWORD (nullable for OAuth users)
    @Column(nullable = true)
    private String password;

    // ✅ PHONE NUMBER (nullable — collected after OAuth)
    @Column(name = "phone_number", nullable = true)
    private String phoneNumber;

    // ✅ ROLE
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppRole role;

    // ✅ LOGIN STATUS
    @Column(name = "is_logged_in", nullable = false)
    private Boolean isLoggedIn;

    // ✅ OAUTH FIELDS
    @Column(name = "auth_provider")
    private String provider = "LOCAL"; // "LOCAL" or "GOOGLE"

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "profile_picture", columnDefinition = "TEXT")
    private String profilePicture;

    // ✅ CREATED TIME
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ✅ UPDATED TIME
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ✅ BEFORE INSERT
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        // default value
        if (this.isLoggedIn == null) {
            this.isLoggedIn = false;
        }

        // normalize
        if (this.email != null) {
            this.email = this.email.toLowerCase();
        }

        if (this.username != null) {
            this.username = this.username.toLowerCase();
        }
    }

    // ✅ BEFORE UPDATE
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}