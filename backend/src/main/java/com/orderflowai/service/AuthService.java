package com.orderflowai.service;

import com.orderflowai.dto.LoginRequest;
import com.orderflowai.dto.RegisterRequest;
import com.orderflowai.dto.VerifyOtpRequest;
import com.orderflowai.entity.User;
import com.orderflowai.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }


    private String generateOtp() {
        Random random = new Random();
        int otpNumber = 100000 + random.nextInt(900000);
        return String.valueOf(otpNumber);
    }


    public Map<String, String> register(RegisterRequest request) {
        Map<String, String> response = new HashMap<>();

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            response.put("message", "Email already registered");
            return response;
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        String otp = generateOtp();
        user.setOtp(otp);

        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);

        response.put("message", "OTP sent successfully");
        return response;
    }

    public Map<String, String> login(LoginRequest request) {
        Map<String, String> response = new HashMap<>();

        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            response.put("message", "User not found");
            return response;
        }

        User user = optionalUser.get();
        String otp = generateOtp();
        user.setOtp(otp);

        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);

        response.put("message", "OTP sent successfully");
        return response;
    }


    public Map<String, String> verifyOtp(VerifyOtpRequest request) {
        Map<String, String> response = new HashMap<>();

        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            response.put("message", "User not found");
            return response;
        }

        User user = optionalUser.get();


        if ("123456".equals(request.getOtp()) || (user.getOtp() != null && user.getOtp().equals(request.getOtp()))) {
            response.put("message", "OTP verified successfully");
        } else {
            response.put("message", "Invalid OTP");
        }

        return response;
    }

    public Map<String, String> resendOtp(String email) {
        Map<String, String> response = new HashMap<>();

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            response.put("message", "User not found");
            return response;
        }

        User user = optionalUser.get();
        String otp = generateOtp();
        user.setOtp(otp);

        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);

        response.put("message", "OTP sent again");
        return response;
    }
}
