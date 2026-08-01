package com.rgreen.servicehub.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;
import com.rgreen.servicehub.model.Ticket;

@Data
public class DashboardStats {
    private long employeeCount;
    private long engineerCount;
    private long newTickets;
    private long openTickets;
    private long resolved;
    private long closed;
    private long totalTickets;
    private long departmentCount;
    private Map<String, Long> ticketStatusMap;
    private Map<String, Long> priorityMap;
    private List<Ticket> recentTickets;
}
