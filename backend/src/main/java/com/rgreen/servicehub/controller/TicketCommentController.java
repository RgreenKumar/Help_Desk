package com.rgreen.servicehub.controller;

import com.rgreen.servicehub.model.TicketComment;
import com.rgreen.servicehub.model.User;
import com.rgreen.servicehub.repository.UserRepository;
import com.rgreen.servicehub.service.TicketCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketCommentController {

    @Autowired
    private TicketCommentService ticketCommentService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ticketCommentService.getCommentsForTicket(id)
        );
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> postComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        String message = payload.get("message");

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String authorName =
                (user.getFirstName() + " " + user.getLastName()).trim();

        String authorRole = user.getRole() != null
                ? user.getRole().name()
                : "USER";

        TicketComment savedComment = ticketCommentService.addComment(
                id,
                message,
                authorName,
                authorRole
        );

        return ResponseEntity.ok(savedComment);
    }
}
