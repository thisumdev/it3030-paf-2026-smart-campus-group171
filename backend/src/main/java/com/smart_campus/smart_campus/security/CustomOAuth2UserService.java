package com.smart_campus.smart_campus.security;

import com.smart_campus.smart_campus.user.entity.User;
import com.smart_campus.smart_campus.user.repository.UserRepository;
import com.smart_campus.smart_campus.core.util.Constants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    /**
     * Spring calls this after Google returns the user's profile.
     * Google's response contains: sub (unique ID), email, name, picture.
     *
     * Our job here:
     *  1. Extract Google attributes
     *  2. Check if this Google user already exists in our DB (by oauthProviderId = sub)
     *  3. If yes → update their name in case it changed
     *  4. If no  → create a new User with role=USER (default — never trust an external source for roles)
     *  5. Return the original OAuth2User — Spring Security still needs it
     *     OAuth2SuccessHandler picks up the saved User next
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        // 1. Let Spring fetch the user profile from Google's userinfo endpoint
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 2. Extract attributes from Google's response
        String oauthProviderId = oAuth2User.getAttribute("sub");   // Google's unique user ID
        String email           = oAuth2User.getAttribute("email");
        String fullName        = oAuth2User.getAttribute("name");

        // 3. Find existing user OR create new one — "find-or-create" pattern
        userRepository.findByOauthProviderId(oauthProviderId)
                .ifPresentOrElse(
                    existingUser -> {
                        // Update name in case user changed it in Google
                        existingUser.setFullName(fullName);
                        userRepository.save(existingUser);
                    },
                    () -> {
                        // First-time login — provision a new User record
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setFullName(fullName);
                        newUser.setOauthProviderId(oauthProviderId);
                        newUser.setRole(User.Role.USER);
                        newUser.setCreatedAt(LocalDateTime.now());
                        userRepository.save(newUser);
                    }
                );

        return oAuth2User; // pass through — SuccessHandler reads the DB user next
    }
}