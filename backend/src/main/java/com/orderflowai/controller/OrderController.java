package com.orderflowai.controller;

import com.orderflowai.dto.CreateOrderRequest;
import com.orderflowai.entity.Order;
import com.orderflowai.entity.User;
import com.orderflowai.service.AuthService;
import com.orderflowai.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://orderflow-ai-frontend.onrender.com"})
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CreateOrderRequest request) {

        User user = authService.validateToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized: Missing, invalid, or expired token"));
        }

        // Associate order with the authenticated user's verified email
        request.setCustomerEmail(user.getEmail());
        Order order = orderService.createOrder(request);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User user = authService.validateToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized: Missing, invalid, or expired token"));
        }

        // Return only orders belonging to the authenticated user
        List<Order> orders = orderService.getOrdersForUser(user.getEmail());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User user = authService.validateToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized: Missing, invalid, or expired token"));
        }

        List<Order> orders = orderService.getTodayOrdersForUser(user.getEmail());
        return ResponseEntity.ok(orders);
    }
}
