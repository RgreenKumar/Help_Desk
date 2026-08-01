package com.rgreen.servicehub.repository;

import com.rgreen.servicehub.model.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {

    List<TicketHistory> findByTicketIdOrderByEventDateAsc(Long ticketId);
}