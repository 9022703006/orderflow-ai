package com.orderflowai.service;

import com.orderflowai.dto.LoginRequest;
import com.orderflowai.dto.RegisterRequest;
import com.orderflowai.dto.VerifyOtpRequest;
import com.orderflowai.entity.User;
import com.orderflowai.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, emailService);
    }

    @Test
    @DisplayName("Verify 1: Correct OTP generates a secure session token and sets expiration")
    void testVerifyOtp_CorrectOtp_GeneratesToken() {
        User user = new User("Test User", "test@example.com", "482910");
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        VerifyOtpRequest request = new VerifyOtpRequest("test@example.com", "482910");
        Map<String, String> response = authService.verifyOtp(request);

        assertEquals("true", response.get("success"));
        assertEquals("OTP verified successfully", response.get("message"));
        assertNotNull(response.get("token"), "Response must contain generated session token");
        assertNotNull(user.getSessionToken(), "User must have sessionToken stored");
        assertNotNull(user.getTokenExpiry(), "User must have tokenExpiry set");
        assertTrue(user.getTokenExpiry().isAfter(LocalDateTime.now().plusHours(23)), "Token should have ~24h validity");
        assertNull(user.getOtp(), "OTP should be cleared after verification");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Verify 2: Incorrect OTP does NOT generate a token")
    void testVerifyOtp_IncorrectOtp_NoToken() {
        User user = new User("Test User", "test@example.com", "482910");
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        VerifyOtpRequest request = new VerifyOtpRequest("test@example.com", "256354");
        Map<String, String> response = authService.verifyOtp(request);

        assertEquals("false", response.get("success"));
        assertEquals("Invalid OTP", response.get("message"));
        assertNull(response.get("token"), "Response must NOT contain token on invalid OTP");
        assertNull(user.getSessionToken(), "User sessionToken must remain null");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Verify 3: Valid token allows authorized access")
    void testValidateToken_ValidToken() {
        User user = new User("Test User", "test@example.com", null);
        user.setSessionToken("valid-token-123");
        user.setTokenExpiry(LocalDateTime.now().plusHours(12));

        when(userRepository.findBySessionToken("valid-token-123")).thenReturn(Optional.of(user));

        User authenticatedUser = authService.validateToken("Bearer valid-token-123");

        assertNotNull(authenticatedUser);
        assertEquals("test@example.com", authenticatedUser.getEmail());
    }

    @Test
    @DisplayName("Verify 4: Missing or invalid token returns null (unauthorized)")
    void testValidateToken_MissingOrInvalidToken() {
        assertNull(authService.validateToken(null), "Null token must return null");
        assertNull(authService.validateToken(""), "Empty token must return null");
        assertNull(authService.validateToken("   "), "Whitespace token must return null");

        when(userRepository.findBySessionToken("unknown-token")).thenReturn(Optional.empty());
        assertNull(authService.validateToken("Bearer unknown-token"), "Non-existent token must return null");
    }

    @Test
    @DisplayName("Verify 5: Expired token returns null and invalidates stored token")
    void testValidateToken_ExpiredToken() {
        User user = new User("Test User", "test@example.com", null);
        user.setSessionToken("expired-token-123");
        user.setTokenExpiry(LocalDateTime.now().minusHours(1)); // Expired 1 hour ago

        when(userRepository.findBySessionToken("expired-token-123")).thenReturn(Optional.of(user));

        User authenticatedUser = authService.validateToken("Bearer expired-token-123");

        assertNull(authenticatedUser, "Expired token must be rejected");
        assertNull(user.getSessionToken(), "Expired token should be cleared from user");
        assertNull(user.getTokenExpiry(), "Token expiry should be cleared");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Verify 7: Logout invalidates the session token")
    void testLogout_InvalidatesToken() {
        User user = new User("Test User", "test@example.com", null);
        user.setSessionToken("active-token-456");
        user.setTokenExpiry(LocalDateTime.now().plusHours(5));

        when(userRepository.findBySessionToken("active-token-456")).thenReturn(Optional.of(user));

        Map<String, String> logoutResponse = authService.logout("Bearer active-token-456");

        assertEquals("true", logoutResponse.get("success"));
        assertNull(user.getSessionToken(), "Session token must be null after logout");
        assertNull(user.getTokenExpiry(), "Token expiry must be null after logout");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Expired OTP is rejected")
    void testVerifyOtp_ExpiredOtp() {
        User user = new User("Test User", "test@example.com", "482910");
        user.setOtpExpiry(LocalDateTime.now().minusMinutes(1));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        VerifyOtpRequest request = new VerifyOtpRequest("test@example.com", "482910");
        Map<String, String> response = authService.verifyOtp(request);

        assertEquals("false", response.get("success"));
        assertEquals("OTP has expired. Please request a new one.", response.get("message"));
        assertNull(response.get("token"));
    }

    @Test
    @DisplayName("Missing OTP is rejected")
    void testVerifyOtp_MissingOtp() {
        VerifyOtpRequest request = new VerifyOtpRequest("test@example.com", "");
        Map<String, String> response = authService.verifyOtp(request);

        assertEquals("false", response.get("success"));
        assertEquals("OTP is required", response.get("message"));
    }

    @Test
    @DisplayName("SMTP delivery failure during login returns error")
    void testLogin_SmtpFailure() {
        User user = new User("Existing User", "existing@example.com", null);
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(user));
        doThrow(new RuntimeException("Could not send OTP email via SMTP: Connection timed out"))
                .when(emailService).sendOtpEmail(eq("existing@example.com"), anyString());

        LoginRequest request = new LoginRequest("existing@example.com");
        Map<String, String> response = authService.login(request);

        assertEquals("false", response.get("success"));
        assertTrue(response.get("message").contains("Failed to send OTP email"));
    }

    @Test
    @DisplayName("Successful registration saves user and sends email")
    void testRegister_Success() {
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        doNothing().when(emailService).sendOtpEmail(eq("new@example.com"), anyString());

        RegisterRequest request = new RegisterRequest("New User", "new@example.com");
        Map<String, String> response = authService.register(request);

        assertEquals("true", response.get("success"));
        assertEquals("OTP sent successfully", response.get("message"));
        verify(userRepository, times(1)).save(any(User.class));
    }
}
