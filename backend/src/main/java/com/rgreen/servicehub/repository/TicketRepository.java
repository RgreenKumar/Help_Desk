package com.rgreen.servicehub.repository;

import com.rgreen.servicehub.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    long countByStatus(String status);

    long countByPriority(String priority);

    List<Ticket> findByStatusIn(List<String> statuses);

    List<Ticket> findByEmployeeEmail(String employeeEmail);

    List<Ticket> findByAssignedEngineer(String assignedEngineer);

    @Query("SELECT MAX(t.ticketId) FROM Ticket t")
    String findMaxTicketId();

    List<Ticket> findTop10ByOrderByCreatedDateDesc();
}