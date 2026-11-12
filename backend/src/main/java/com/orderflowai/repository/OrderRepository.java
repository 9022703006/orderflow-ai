package com.orderflowai.repository;

import com.orderflowai.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Order> findByCustomerEmail(String customerEmail);

    List<Order> findByCustomerEmailAndCreatedAtBetween(String customerEmail, LocalDateTime start, LocalDateTime end);
}
