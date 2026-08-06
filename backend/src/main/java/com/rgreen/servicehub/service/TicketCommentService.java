package com.rgreen.servicehub.service;

import com.rgreen.servicehub.model.Ticket;
import com.rgreen.servicehub.model.TicketComment;
import com.rgreen.servicehub.repository.TicketCommentRepository;
import com.rgreen.servicehub.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketCommentService {

    @Autowired
    private TicketCommentRepository ticketCommentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    public List<TicketComment> getCommentsForTicket(Long ticketId) {
        // make sure the ticket actually exists before returning its comments
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return ticketCommentRepository
                .findByTicketIdOrderByCreatedDateAsc(ticketId);
    }

    public TicketComment addComment(
            Long ticketId,
            String message,
            String authorName,
            String authorRole) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (message == null || message.trim().isEmpty()) {
            throw new RuntimeException("Comment message is required");
        }

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticket.getId());
        comment.setMessage(message.trim());
        comment.setAuthorName(
                authorName == null || authorName.trim().isEmpty()
                        ? "Unknown"
                        : authorName
        );
        comment.setAuthorRole(authorRole);

        return ticketCommentRepository.save(comment);
    }
}
