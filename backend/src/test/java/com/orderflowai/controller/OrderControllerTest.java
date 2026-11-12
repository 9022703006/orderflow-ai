package com.orderflowai.controller;

import com.orderflowai.dto.CreateOrderRequest;
import com.orderflowai.entity.Order;
import com.orderflowai.entity.User;
import com.orderflowai.service.AuthService;
import com.orderflowai.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @Mock
    private AuthService authService;

    private OrderController orderController;

    @BeforeEach
    void setUp() {
        orderController = new OrderController(orderService, authService);
    }

    @Test
    @DisplayName("Verify 4: Missing token returns HTTP 401 Unauthorized")
    void testGetAllOrders_MissingToken_Returns401() {
        when(authService.validateToken(null)).thenReturn(null);

        ResponseEntity<?> response = orderController.getAllOrders(null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(orderService, never()).getOrdersForUser(anyString());
    }

    @Test
    @DisplayName("Verify 4: Invalid token returns HTTP 401 Unauthorized")
    void testGetAllOrders_InvalidToken_Returns401() {
        when(authService.validateToken("Bearer bad-token")).thenReturn(null);

        ResponseEntity<?> response = orderController.getAllOrders("Bearer bad-token");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(orderService, never()).getOrdersForUser(anyString());
    }

    @Test
    @DisplayName("Verify 5: Expired token returns HTTP 401 Unauthorized")
    void testCreateOrder_ExpiredToken_Returns401() {
        when(authService.validateToken("Bearer expired-token")).thenReturn(null);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerName("Rahul");
        request.setCustomerEmail("rahul@example.com");
        request.setProduct("Tractor");
        request.setQuantity(1);
        request.setPrice(450000.0);

        ResponseEntity<?> response = orderController.createOrder("Bearer expired-token", request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(orderService, never()).createOrder(any(CreateOrderRequest.class));
    }

    @Test
    @DisplayName("Verify 3 & 6: Valid token allows authorized access and user accesses only their own orders")
    void testGetAllOrders_ValidToken_ReturnsOnlyUserOrders() {
        User user = new User("Alice", "alice@example.com", null);
        when(authService.validateToken("Bearer token-alice")).thenReturn(user);

        Order aliceOrder = new Order("Alice", "alice@example.com", "Plow", 1, 10000.0, 10000.0, "Pending");
        when(orderService.getOrdersForUser("alice@example.com")).thenReturn(List.of(aliceOrder));

        ResponseEntity<?> response = orderController.getAllOrders("Bearer token-alice");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<?> returnedOrders = (List<?>) response.getBody();
        assertNotNull(returnedOrders);
        assertEquals(1, returnedOrders.size());
        assertEquals(aliceOrder, returnedOrders.get(0));

        // Verify that orderService was strictly called with Alice's email, not Bob's or anyone else's
        verify(orderService, times(1)).getOrdersForUser("alice@example.com");
    }

    @Test
    @DisplayName("Verify 6: Create order binds order to authenticated user email, preventing spoofing")
    void testCreateOrder_BindsToAuthenticatedEmail() {
        User user = new User("Alice", "alice@example.com", null);
        when(authService.validateToken("Bearer token-alice")).thenReturn(user);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerName("Alice");
        request.setCustomerEmail("bob@example.com"); // Attacker tries to pass Bob's email
        request.setProduct("Tractor");
        request.setQuantity(2);
        request.setPrice(400000.0);

        Order savedOrder = new Order("Alice", "alice@example.com", "Tractor", 2, 400000.0, 800000.0, "Pending");
        when(orderService.createOrder(any(CreateOrderRequest.class))).thenReturn(savedOrder);

        ResponseEntity<?> response = orderController.createOrder("Bearer token-alice", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        ArgumentCaptor<CreateOrderRequest> captor = ArgumentCaptor.forClass(CreateOrderRequest.class);
        verify(orderService).createOrder(captor.capture());

        // Must be bound to authenticated user's email, not spoofed email
        assertEquals("alice@example.com", captor.getValue().getCustomerEmail());
    }
}
