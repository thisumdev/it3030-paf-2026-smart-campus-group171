package com.smart_campus.smart_campus.user.repository;

import com.smart_campus.smart_campus.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByOauthProviderId(String oauthProviderId);

    // Changed from String to User.Role to match the entity
    List<User> findByRole(User.Role role);

    boolean existsByEmail(String email);
}