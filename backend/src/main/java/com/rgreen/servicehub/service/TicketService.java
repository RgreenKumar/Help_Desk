package com.rgreen.servicehub.service;

import com.rgreen.servicehub.model.Role;
import com.rgreen.servicehub.model.SupportEngineer;
import com.rgreen.servicehub.model.Ticket;
import com.rgreen.servicehub.model.TicketHistory;
import com.rgreen.servicehub.model.User;
import com.rgreen.servicehub.repository.SupportEngineerRepository;
import com.rgreen.servicehub.repository.TicketHistoryRepository;
import com.rgreen.servicehub.repository.TicketRepository;
import com.rgreen.servicehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupportEngineerRepository supportEngineerRepository;

    @Autowired
    private TicketHistoryRepository ticketHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.EMPLOYEE) {
            return ticketRepository.findByEmployeeEmail(email);
        }

        if (user.getRole() == Role.SUPPORT_ENGINEER) {
            SupportEngineer engineer = supportEngineerRepository
                    .findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException("Support engineer not found"));

            String engineerName =
                    (engineer.getFirstName() + " " + engineer.getLastName())
                            .trim();

            return ticketRepository.findByAssignedEngineer(engineerName);
        }

        return ticketRepository.findAll();
    }

    public Ticket getById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Ticket createTicket(Ticket ticket) {
        ticket.setTicketId(generateTicketId());

        if (ticket.getStatus() == null
                || ticket.getStatus().trim().isEmpty()) {
            ticket.setStatus("Open");
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        saveHistory(
                savedTicket,
                savedTicket.getStatus(),
                "Ticket created",
                savedTicket.getEmployeeName()
        );

        String employeeName = getEmployeeName(savedTicket);

        notificationService.createNotification(
                "New ticket "
                        + savedTicket.getTicketId()
                        + " was raised by "
                        + employeeName,
                "ticket-created"
        );

        return savedTicket;
    }

    public Ticket updateTicket(Long id, Ticket updated) {
        Ticket existing = getById(id);

        String previousStatus = existing.getStatus();

        existing.setSubject(updated.getSubject());
        existing.setDescription(updated.getDescription());
        existing.setCategory(updated.getCategory());
        existing.setSubcategory(updated.getSubcategory());
        existing.setPriority(updated.getPriority());

        if ("Closed".equalsIgnoreCase(updated.getStatus())
                && !"Closed".equalsIgnoreCase(existing.getStatus())) {
            existing.setClosedDate(LocalDateTime.now());
        }

        if ("Reopened".equalsIgnoreCase(updated.getStatus())) {
            existing.setClosedDate(null);
        }

        existing.setStatus(updated.getStatus());

        Ticket savedTicket = ticketRepository.save(existing);

        if (!sameStatus(previousStatus, savedTicket.getStatus())) {
            saveHistory(
                    savedTicket,
                    savedTicket.getStatus(),
                    getActionForStatus(savedTicket.getStatus()),
                    getHistoryActor(savedTicket)
            );

            createStatusNotification(savedTicket);
        }

        return savedTicket;
    }

    public Ticket assignEngineer(Long id, String engineerName) {
        Ticket ticket = getById(id);

        String previousEngineer = ticket.getAssignedEngineer();

        ticket.setAssignedEngineer(engineerName);
        ticket.setStatus("Assigned");

        Ticket savedTicket = ticketRepository.save(ticket);

        String action;

        if (previousEngineer == null
                || previousEngineer.trim().isEmpty()) {
            action = "Ticket assigned to " + engineerName;
        } else if (previousEngineer.equalsIgnoreCase(engineerName)) {
            action = "Ticket assignment confirmed for " + engineerName;
        } else {
            action = "Ticket reassigned from "
                    + previousEngineer
                    + " to "
                    + engineerName;
        }

        saveHistory(
                savedTicket,
                "Assigned",
                action,
                "Admin"
        );

        if (previousEngineer == null
                || previousEngineer.trim().isEmpty()) {
            notificationService.createNotification(
                    savedTicket.getTicketId()
                            + " was assigned to "
                            + engineerName,
                    "ticket-assigned"
            );
        } else if (!previousEngineer.equalsIgnoreCase(engineerName)) {
            notificationService.createNotification(
                    savedTicket.getTicketId()
                            + " was reassigned from "
                            + previousEngineer
                            + " to "
                            + engineerName,
                    "ticket-assigned"
            );
        }

        return savedTicket;
    }

    public Ticket updateStatus(Long id, String status) {
        Ticket ticket = getById(id);

        if (status == null || status.trim().isEmpty()) {
            throw new RuntimeException("Status is required");
        }

        String normalizedStatus = normalizeStatus(status);

        if (!isValidStatus(normalizedStatus)) {
            throw new RuntimeException("Invalid ticket status");
        }

        String previousStatus = ticket.getStatus();

        ticket.setStatus(normalizedStatus);

        if ("Closed".equalsIgnoreCase(normalizedStatus)) {
            ticket.setClosedDate(LocalDateTime.now());
        }

        if ("Reopened".equalsIgnoreCase(normalizedStatus)) {
            ticket.setClosedDate(null);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        if (!sameStatus(previousStatus, normalizedStatus)) {
            saveHistory(
                    savedTicket,
                    normalizedStatus,
                    getActionForStatus(normalizedStatus),
                    getHistoryActor(savedTicket)
            );

            createStatusNotification(savedTicket);
        }

        return savedTicket;
    }

    public List<TicketHistory> getHistoryForTicket(Long ticketId) {
        getById(ticketId);

        return ticketHistoryRepository
                .findByTicketIdOrderByEventDateAsc(ticketId);
    }

    private void saveHistory(
            Ticket ticket,
            String status,
            String action,
            String performedBy) {

        TicketHistory history = new TicketHistory();

        history.setTicketId(ticket.getId());
        history.setTicketCode(ticket.getTicketId());
        history.setStatus(status);
        history.setAction(action);
        history.setPerformedBy(
                performedBy == null || performedBy.trim().isEmpty()
                        ? "System"
                        : performedBy
        );
        history.setEventDate(LocalDateTime.now());

        ticketHistoryRepository.save(history);
    }

    private void createStatusNotification(Ticket ticket) {
        String status = ticket.getStatus();
        String ticketId = ticket.getTicketId();
        String engineer = getEngineerName(ticket);

        if ("Accepted".equalsIgnoreCase(status)) {
            notificationService.createNotification(
                    engineer
                            + " accepted "
                            + ticketId,
                    "ticket-accepted"
            );
            return;
        }

        if ("In Progress".equalsIgnoreCase(status)) {
            notificationService.createNotification(
                    ticketId
                            + " is now In Progress",
                    "ticket-in-progress"
            );
            return;
        }

        if ("Resolved".equalsIgnoreCase(status)) {
            notificationService.createNotification(
                    ticketId
                            + " has been resolved by "
                            + engineer,
                    "ticket-resolved"
            );
            return;
        }

        if ("Closed".equalsIgnoreCase(status)) {
            notificationService.createNotification(
                    ticketId + " has been closed",
                    "ticket-closed"
            );
            return;
        }

        if ("Reopened".equalsIgnoreCase(status)) {
            notificationService.createNotification(
                    ticketId + " has been reopened",
                    "ticket-reopened"
            );
            return;
        }

        if ("Open".equalsIgnoreCase(status)) {
            notificationService.createNotification(
                    ticketId + " is now Open",
                    "ticket-open"
            );
        }
    }

    private String getEmployeeName(Ticket ticket) {
        if (ticket.getEmployeeName() != null
                && !ticket.getEmployeeName().trim().isEmpty()) {
            return ticket.getEmployeeName();
        }

        return "Employee";
    }

    private String getEngineerName(Ticket ticket) {
        if (ticket.getAssignedEngineer() != null
                && !ticket.getAssignedEngineer().trim().isEmpty()) {
            return ticket.getAssignedEngineer();
        }

        return "Support Engineer";
    }

    private String getHistoryActor(Ticket ticket) {
        if (ticket.getAssignedEngineer() != null
                && !ticket.getAssignedEngineer().trim().isEmpty()) {
            return ticket.getAssignedEngineer();
        }

        if (ticket.getEmployeeName() != null
                && !ticket.getEmployeeName().trim().isEmpty()) {
            return ticket.getEmployeeName();
        }

        return "System";
    }

    private String getActionForStatus(String status) {
        if (status == null) {
            return "Ticket status updated";
        }

        if (status.equalsIgnoreCase("Open")) {
            return "Ticket opened";
        }

        if (status.equalsIgnoreCase("Assigned")) {
            return "Ticket assigned";
        }

        if (status.equalsIgnoreCase("Accepted")) {
            return "Engineer accepted the ticket";
        }

        if (status.equalsIgnoreCase("In Progress")) {
            return "Engineer started working on the ticket";
        }

        if (status.equalsIgnoreCase("Resolved")) {
            return "Ticket resolved";
        }

        if (status.equalsIgnoreCase("Closed")) {
            return "Ticket closed";
        }

        if (status.equalsIgnoreCase("Reopened")) {
            return "Ticket reopened";
        }

        return "Ticket status updated";
    }

    private boolean sameStatus(String first, String second) {
        if (first == null && second == null) {
            return true;
        }

        if (first == null || second == null) {
            return false;
        }

        return first.equalsIgnoreCase(second);
    }

    private String normalizeStatus(String status) {
        String value = status.trim();

        if (value.equalsIgnoreCase("in_progress")
                || value.equalsIgnoreCase("in progress")) {
            return "In Progress";
        }

        if (value.equalsIgnoreCase("open")) {
            return "Open";
        }

        if (value.equalsIgnoreCase("assigned")) {
            return "Assigned";
        }

        if (value.equalsIgnoreCase("accepted")) {
            return "Accepted";
        }

        if (value.equalsIgnoreCase("resolved")) {
            return "Resolved";
        }

        if (value.equalsIgnoreCase("closed")) {
            return "Closed";
        }

        if (value.equalsIgnoreCase("reopened")) {
            return "Reopened";
        }

        return value;
    }

    private boolean isValidStatus(String status) {
        return status.equalsIgnoreCase("Open")
                || status.equalsIgnoreCase("Assigned")
                || status.equalsIgnoreCase("Accepted")
                || status.equalsIgnoreCase("In Progress")
                || status.equalsIgnoreCase("Resolved")
                || status.equalsIgnoreCase("Closed")
                || status.equalsIgnoreCase("Reopened");
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    private String generateTicketId() {
        String maxId = ticketRepository.findMaxTicketId();

        if (maxId == null) {
            return "RG-1001";
        }

        int num = Integer.parseInt(maxId.substring(3));

        return "RG-" + (num + 1);
    }
}