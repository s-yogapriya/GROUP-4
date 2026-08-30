package com.infosys.carbonfootprint.security;

import com.infosys.carbonfootprint.entity.Role;
import com.infosys.carbonfootprint.entity.RoleType;
import com.infosys.carbonfootprint.entity.User;
import com.infosys.carbonfootprint.entity.UserStatus;
import com.infosys.carbonfootprint.repository.RoleRepository;
import com.infosys.carbonfootprint.repository.UserRepository;
import com.infosys.carbonfootprint.security.jwt.JwtUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final UserRepository users;
    private final RoleRepository roles;
    private final JwtUtils jwtUtils;
    private final String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(UserRepository users, RoleRepository roles, JwtUtils jwtUtils,
                                              @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.users = users; this.roles = roles; this.jwtUtils = jwtUtils; this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth = (OAuth2User) authentication.getPrincipal();
        String email = firstNonBlank(oauth.getAttribute("email"), oauth.getAttribute("login"));
        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendUrl + "/login?oauthError=" + enc("OAuth provider did not return an email address."));
            return;
        }

        final String provider = request.getRequestURI().contains("/github") ? "github" : "google";
        User user = users.findByEmail(email).orElseGet(() -> createUser(oauth, email, provider));
        if (user.getStatus() == UserStatus.REJECTED) {
            response.sendRedirect(frontendUrl + "/login?oauthError=" + enc("This account has been rejected."));
            return;
        }

        UserDetailsImpl details = UserDetailsImpl.build(user);
        var auth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                details, null, details.getAuthorities());
        String token = jwtUtils.generateJwtToken(auth);
        response.sendRedirect(frontendUrl + "/oauth2/callback?token=" + enc(token));
    }

    private User createUser(OAuth2User oauth, String email, String provider) {
        String rawName = firstNonBlank(oauth.getAttribute("name"), oauth.getAttribute("login"), provider + " user");
        String[] parts = rawName.trim().split("\\s+", 2);
        String first = parts[0];
        String last = parts.length > 1 ? parts[1] : "User";
        String base = (provider + "_" + first + "_" + last).replaceAll("[^A-Za-z0-9_]", "").toLowerCase();
        String username = base.isBlank() ? provider + "_user" : base;
        int suffix = 1;
        while (users.existsByUsername(username)) username = base + suffix++;

        Set<Role> roleSet = new HashSet<>();
        Role userRole = roles.findByName(RoleType.ROLE_USER).orElseThrow();
        roleSet.add(userRole);

        return users.save(User.builder().username(username).email(email)
                .firstName(first).lastName(last)
                .password(null).status(UserStatus.APPROVED).firstLogin(false).roles(roleSet).build());
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) if (v != null && !v.isBlank()) return v;
        return null;
    }
    private static String enc(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
}
