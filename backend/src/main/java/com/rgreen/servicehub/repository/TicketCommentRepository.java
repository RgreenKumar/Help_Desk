package com.rgreen.servicehub.repository;

import com.rgreen.servicehub.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    List<TicketComment> findByTicketIdOrderByCreatedDateAsc(Long ticketId);
}
