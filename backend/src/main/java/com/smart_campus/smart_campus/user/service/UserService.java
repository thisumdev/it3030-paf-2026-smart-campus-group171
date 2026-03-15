package com.smart_campus.smart_campus.user.service;

import com.smart_campus.smart_campus.core.exception.CustomExceptions.*;
import com.smart_campus.smart_campus.security.JwtUtil;
import com.smart_campus.smart_campus.user.dto.AuthResponse;
import com.smart_campus.smart_campus.user.dto.LoginRequest;
import com.smart_campus.smart_campus.user.dto.RegisterRequest;
import com.smart_campus.smart_campus.user.entity.User;
import com.smart_campus.smart_campus.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    // Injected from AppConfig Bean — no manual instantiation
    // @RequiredArgsConstructor includes this in the constructor automatically
    private final BCryptPasswordEncoder passwordEncoder;

    // ── AUTH OPERATIONS ───────────────────────────────────────────────────────

    /**
     * Manual registration — email + password path.
     * OAuth2 users go through CustomOAuth2UserService instead.
     * Role is always USER — client can never self-assign ADMIN.
     * JWT issued immediately after registration — no separate login step needed.
     */
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceConflictException(
                "An account with this email already exists"
            );
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        // oauthProviderId = null — signals manual account to other services

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    /**
     * Manual login — email + password path.
     * Generic error messages on cases 1 and 3 prevent user enumeration attacks.
     * Case 2 gives specific message — OAuth users need to know to use Google button.
     */
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // OAuth-only account — has no password set
        if (user.getPassword() == null) {
            throw new BadRequestException(
                "This account uses Google Sign-In. Please click 'Sign in with Google'."
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    /**
     * GET /api/users/me
     * Re-issues a fresh token on every call — extends session for active users.
     * Without this, any user active longer than 24h would be auto logged out.
     */
    public AuthResponse getMyProfile() {
        User user = getCurrentUser();
        return buildAuthResponse(user);
    }

    // ── USER MANAGEMENT OPERATIONS ────────────────────────────────────────────

    /**
     * Extracts the authenticated User from SecurityContext.
     * JwtAuthFilter already set this as the principal.
     * Used by any service method that needs to know who is calling.
     */
    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        throw new UnauthorizedException("No authenticated user found");
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public List<User> getAllUsers(String role) {
        if (role != null && !role.isBlank()) {
            try {
                User.Role roleEnum = User.Role.valueOf(role.toUpperCase());
                return userRepository.findByRole(roleEnum);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException(
                    "Invalid role: " + role + ". Must be USER, ADMIN or TECHNICIAN"
                );
            }
        }
        return userRepository.findAll();
    }

    public User updateUserRole(Long id, String newRole) {
        User user = getUserById(id);
        try {
            user.setRole(User.Role.valueOf(newRole.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                "Invalid role: " + newRole + ". Must be USER, ADMIN or TECHNICIAN"
            );
        }
        return userRepository.save(user);
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    /**
     * Single place to build AuthResponse — used by register, login, and getMyProfile.
     * If AuthResponse shape changes, only this method needs updating.
     */
    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(
            user.getEmail(),
            user.getRole(),
            user.getId()
        );
        return new AuthResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name()
        );
    }

    /**
 * Deletes a user by ID. ADMIN only (enforced at controller level).
 * Prevents an admin from deleting their own account.
 */
public void deleteUser(Long id) {
    User target = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

    User currentAdmin = getCurrentUser();
    if (currentAdmin.getId().equals(target.getId())) {
        throw new BadRequestException("You cannot delete your own account.");
    }

    userRepository.deleteById(id);
}
}