package com.rgreen.servicehub.controller;

import com.rgreen.servicehub.model.Ticket;
import com.rgreen.servicehub.model.TicketHistory;
import com.rgreen.servicehub.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(Authentication authentication) {
        String email = authentication.getName();

        return ResponseEntity.ok(
                ticketService.getTicketsForUser(email)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ticketService.getById(id)
        );
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<TicketHistory>> getTicketHistory(
            @PathVariable Long id) {

        List<TicketHistory> history =
                ticketService.getHistoryForTicket(id);

        System.out.println("========== HISTORY DEBUG ==========");
        System.out.println("Ticket ID: " + id);
        System.out.println("History count: " + history.size());

        for (TicketHistory item : history) {
            System.out.println(
                    item.getId() + " | "
                            + item.getStatus() + " | "
                            + item.getAction()
            );
        }

        System.out.println("===================================");

        return ResponseEntity.ok(history);
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        return ResponseEntity.ok(
                ticketService.createTicket(ticket)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable Long id,
            @RequestBody Ticket ticket) {

        return ResponseEntity.ok(
                ticketService.updateTicket(id, ticket)
        );
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignEngineer(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        String engineerName = payload.get("engineerName");

        return ResponseEntity.ok(
                ticketService.assignEngineer(id, engineerName)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        String status = payload.get("status");

        return ResponseEntity.ok(
                ticketService.updateStatus(id, status)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);

        return ResponseEntity.ok().build();
    }
}