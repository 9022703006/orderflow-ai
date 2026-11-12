package com.orderflowai.service;

import com.orderflowai.entity.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${brevo.sender.email:${BREVO_SENDER_EMAIL:${spring.mail.username:}}}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public void sendOtpEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (senderEmail != null && !senderEmail.trim().isEmpty()) {
                message.setFrom(senderEmail.trim());
            }
            message.setTo(email);
            message.setSubject("OrderFlow AI - Your OTP");
            message.setText("OrderFlow AI\n\nYour OTP is: " + otp);
            mailSender.send(message);
            System.out.println("OTP email successfully sent to " + email);
        } catch (Exception e) {
            System.err.println("Could not send OTP email via SMTP: " + e.getMessage());
            throw new RuntimeException("Could not send OTP email via SMTP: " + e.getMessage(), e);
        }
    }

    public void sendOrderConfirmationEmail(Order order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (senderEmail != null && !senderEmail.trim().isEmpty()) {
                message.setFrom(senderEmail.trim());
            }
            message.setTo(order.getCustomerEmail());
            message.setSubject("Order Confirmation - OrderFlow AI");
            message.setText("Hello " + order.getCustomerName() + ",\n\n"
                    + "Thank you for placing your order with OrderFlow AI!\n\n"
                    + "Order Summary:\n"
                    + "Order ID: " + order.getId() + "\n"
                    + "Product: " + order.getProduct() + "\n"
                    + "Quantity: " + order.getQuantity() + "\n"
                    + "Price: " + order.getPrice() + "\n"
                    + "Total: " + order.getTotal() + "\n"
                    + "Status: " + order.getStatus() + "\n\n"
                    + "Regards,\nOrderFlow AI Team");
            mailSender.send(message);
            System.out.println("Order confirmation email successfully sent to " + order.getCustomerEmail());
        } catch (Exception e) {
            System.err.println("Could not send order confirmation email via SMTP: " + e.getMessage());
            throw new RuntimeException("Could not send order confirmation email via SMTP: " + e.getMessage(), e);
        }
    }
}
