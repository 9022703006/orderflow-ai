package com.orderflowai.service;

import com.orderflowai.dto.CreateOrderRequest;
import com.orderflowai.entity.Order;
import com.orderflowai.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }

    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setProduct(request.getProduct());
        order.setQuantity(request.getQuantity());
        order.setPrice(request.getPrice());

        double total = request.getQuantity() * request.getPrice();
        order.setTotal(total);

        order.setStatus("Pending");
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        emailService.sendOrderConfirmationEmail(savedOrder);

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersForUser(String customerEmail) {
        return orderRepository.findByCustomerEmail(customerEmail);
    }

    public List<Order> getTodayOrders() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return orderRepository.findByCreatedAtBetween(start, end);
    }

    public List<Order> getTodayOrdersForUser(String customerEmail) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return orderRepository.findByCustomerEmailAndCreatedAtBetween(customerEmail, start, end);
    }
}
