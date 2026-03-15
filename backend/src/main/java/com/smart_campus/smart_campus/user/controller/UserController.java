package com.smart_campus.smart_campus.user.controller;

import com.smart_campus.smart_campus.core.util.ApiResponse;
import com.smart_campus.smart_campus.user.dto.AuthResponse;
import com.smart_campus.smart_campus.user.dto.LoginRequest;
import com.smart_campus.smart_campus.user.dto.RegisterRequest;
import com.smart_campus.smart_campus.user.entity.User;
import com.smart_campus.smart_campus.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── AUTH ENDPOINTS ────────────────────────────────────────────────────────

    /**
     * POST /api/users/register
     * HTTP 201 Created
     * Public — no token needed
     * @Valid triggers RegisterRequest validation → GlobalExceptionHandler returns 400 on failure
     *
     * HATEOAS links:
     *  self  → the register endpoint itself
     *  login → where to go next if they want to login separately
     *  me    → where to fetch their profile after registering
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<EntityModel<AuthResponse>>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse authResponse = userService.register(request);

        EntityModel<AuthResponse> model = EntityModel.of(authResponse,
            linkTo(methodOn(UserController.class).register(null)).withSelfRel(),
            linkTo(methodOn(UserController.class).login(null)).withRel("login"),
            linkTo(methodOn(UserController.class).getMyProfile()).withRel("me")
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Account created successfully", model));
    }

    /**
     * POST /api/users/login
     * HTTP 200
     * Public — no token needed
     *
     * HATEOAS links:
     *  self     → this login endpoint
     *  me       → fetch profile with the returned token
     *  register → in case they don't have an account
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<EntityModel<AuthResponse>>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse authResponse = userService.login(request);

        EntityModel<AuthResponse> model = EntityModel.of(authResponse,
            linkTo(methodOn(UserController.class).login(null)).withSelfRel(),
            linkTo(methodOn(UserController.class).getMyProfile()).withRel("me"),
            linkTo(methodOn(UserController.class).register(null)).withRel("register")
        );

        return ResponseEntity.ok(
            ApiResponse.success("Login successful", model)
        );
    }

    /**
     * GET /api/users/me
     * HTTP 200 | 401
     * Requires valid JWT — any role
     * Called by React on app reload to verify token and restore session
     *
     * HATEOAS links:
     *  self         → this endpoint
     *  update-role  → admin can promote this user (ADMIN only — shown for discoverability)
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<EntityModel<AuthResponse>>> getMyProfile() {

        AuthResponse authResponse = userService.getMyProfile();

        EntityModel<AuthResponse> model = EntityModel.of(authResponse,
            linkTo(methodOn(UserController.class).getMyProfile()).withSelfRel(),
            linkTo(methodOn(UserController.class)
                .updateUserRole(authResponse.getUserId(), null)).withRel("update-role")
        );

        return ResponseEntity.ok(
            ApiResponse.success("Profile retrieved", model)
        );
    }

    // ── USER MANAGEMENT ENDPOINTS (ADMIN) ────────────────────────────────────

    /**
     * GET /api/users/{id}
     * HTTP 200 | 404
     * ADMIN only
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EntityModel<User>>> getUserById(
            @PathVariable Long id) {

        User user = userService.getUserById(id);

        EntityModel<User> model = EntityModel.of(user,
            linkTo(methodOn(UserController.class).getUserById(id)).withSelfRel(),
            linkTo(methodOn(UserController.class).getAllUsers(null)).withRel("all-users"),
            linkTo(methodOn(UserController.class).updateUserRole(id, null)).withRel("update-role")
        );

        return ResponseEntity.ok(
            ApiResponse.success("User found", model)
        );
    }

    /**
     * GET /api/users?role=USER
     * HTTP 200
     * ADMIN only — list all users, optionally filtered by role
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(
            @RequestParam(required = false) String role) {

        List<User> users = userService.getAllUsers(role);
        return ResponseEntity.ok(
            ApiResponse.success("Users retrieved", users)
        );
    }

    /**
     * PUT /api/users/{id}/role
     * HTTP 200 | 400 | 404
     * ADMIN only
     * Body: { "role": "ADMIN" }
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EntityModel<User>>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        User updated = userService.updateUserRole(id, body.get("role"));

        EntityModel<User> model = EntityModel.of(updated,
            linkTo(methodOn(UserController.class).getUserById(id)).withSelfRel(),
            linkTo(methodOn(UserController.class).getAllUsers(null)).withRel("all-users")
        );

        return ResponseEntity.ok(
            ApiResponse.success("Role updated to " + updated.getRole().name(), model)
        );
    }

    /**
 * DELETE /api/users/{id}
 * Deletes a user. ADMIN only. Returns 204 No Content.
 */
@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity
            .status(HttpStatus.NO_CONTENT)
            .body(ApiResponse.noContent("User deleted successfully."));
}
}