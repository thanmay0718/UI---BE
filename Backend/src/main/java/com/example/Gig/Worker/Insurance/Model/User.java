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
                @UniqueConstraint(columnNames = "phone_number"),
                @UniqueConstraint(columnNames = "username")
        }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ FULL NAME
    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    // ✅ USERNAME (for login/display)
    @NotBlank(message = "Username is required")
    @Column(nullable = false)
    private String username;

    // ✅ EMAIL
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false)
    private String email;

    // ✅ PASSWORD
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Column(nullable = false)
    private String password;

    // ✅ PHONE NUMBER
    @NotNull(message = "Phone number is required")
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    // ✅ ROLE
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppRole role;

    // ✅ LOGIN STATUS
    @Column(name = "is_logged_in", nullable = false)
    private Boolean isLoggedIn;

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