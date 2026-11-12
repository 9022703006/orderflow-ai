package com.orderflowai.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(mailSender);
        emailService.setSenderEmail("verified-sender@brevo.com");
    }

    @Test
    @DisplayName("Case 6: sendOtpEmail sets verified sender and recipient properly")
    void testSendOtpEmail_Success() {
        emailService.sendOtpEmail("recipient@example.com", "654321");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(captor.capture());

        SimpleMailMessage sentMessage = captor.getValue();
        assertEquals("verified-sender@brevo.com", sentMessage.getFrom());
        assertArrayEquals(new String[]{"recipient@example.com"}, sentMessage.getTo());
        assertTrue(sentMessage.getText().contains("654321"));
    }

    @Test
    @DisplayName("Case 5: sendOtpEmail throws RuntimeException when mailSender fails")
    void testSendOtpEmail_Failure() {
        doThrow(new MailSendException("SMTP relay rejected")).when(mailSender).send(any(SimpleMailMessage.class));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            emailService.sendOtpEmail("recipient@example.com", "654321");
        });

        assertTrue(exception.getMessage().contains("Could not send OTP email via SMTP"));
    }
}
