package com.orderflowai.controller;

import com.orderflowai.dto.LoginRequest;
import com.orderflowai.dto.RegisterRequest;
import com.orderflowai.dto.VerifyOtpRequest;
import com.orderflowai.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(authService);
    }

    @Test
    @DisplayName("Verify OTP: Success returns HTTP 200 with session token")
    void testVerifyOtp_Success() {
        Map<String, String> serviceResponse = new HashMap<>();
        serviceResponse.put("success", "true");
        serviceResponse.put("message", "OTP verified successfully");
        serviceResponse.put("token", "session-token-xyz");
        when(authService.verifyOtp(any(VerifyOtpRequest.class))).thenReturn(serviceResponse);

        ResponseEntity<Map<String, String>> response = authController.verifyOtp(new VerifyOtpRequest("user@test.com", "123456"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("true", response.getBody().get("success"));
        assertEquals("session-token-xyz", response.getBody().get("token"));
    }

    @Test
    @DisplayName("Verify OTP: Incorrect OTP returns HTTP 400 Bad Request")
    void testVerifyOtp_IncorrectOtp() {
        Map<String, String> serviceResponse = new HashMap<>();
        serviceResponse.put("success", "false");
        serviceResponse.put("message", "Invalid OTP");
        when(authService.verifyOtp(any(VerifyOtpRequest.class))).thenReturn(serviceResponse);

        ResponseEntity<Map<String, String>> response = authController.verifyOtp(new VerifyOtpRequest("user@test.com", "256354"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("false", response.getBody().get("success"));
        assertEquals("Invalid OTP", response.getBody().get("message"));
    }

    @Test
    @DisplayName("Logout: Invalidate token returns HTTP 200")
    void testLogout_Success() {
        Map<String, String> serviceResponse = new HashMap<>();
        serviceResponse.put("success", "true");
        serviceResponse.put("message", "Logged out successfully");
        when(authService.logout("Bearer my-token")).thenReturn(serviceResponse);

        ResponseEntity<Map<String, String>> response = authController.logout("Bearer my-token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("true", response.getBody().get("success"));
    }

    @Test
    @DisplayName("Login: SMTP failure returns HTTP 400 Bad Request")
    void testLogin_SmtpFailure() {
        Map<String, String> serviceResponse = new HashMap<>();
        serviceResponse.put("success", "false");
        serviceResponse.put("message", "Failed to send OTP email: 535 Authentication Failed");
        when(authService.login(any(LoginRequest.class))).thenReturn(serviceResponse);

        ResponseEntity<Map<String, String>> response = authController.login(new LoginRequest("user@test.com"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("false", response.getBody().get("success"));
    }

    @Test
    @DisplayName("Register: Success returns HTTP 200")
    void testRegister_Success() {
        Map<String, String> serviceResponse = new HashMap<>();
        serviceResponse.put("success", "true");
        serviceResponse.put("message", "OTP sent successfully");
        when(authService.register(any(RegisterRequest.class))).thenReturn(serviceResponse);

        ResponseEntity<Map<String, String>> response = authController.register(new RegisterRequest("Rahul", "rahul@test.com"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("true", response.getBody().get("success"));
    }
}
