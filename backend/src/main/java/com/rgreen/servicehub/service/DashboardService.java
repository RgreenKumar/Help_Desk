package com.rgreen.servicehub.service;

import com.rgreen.servicehub.dto.DashboardStats;
import com.rgreen.servicehub.repository.DepartmentRepository;
import com.rgreen.servicehub.repository.EmployeeRepository;
import com.rgreen.servicehub.repository.SupportEngineerRepository;
import com.rgreen.servicehub.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private SupportEngineerRepository engineerRepository;
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private DepartmentRepository departmentRepository;

    public DashboardStats getStats() {
        DashboardStats stats = new DashboardStats();
        stats.setEmployeeCount(employeeRepository.count());
        stats.setEngineerCount(engineerRepository.count());
        stats.setDepartmentCount(departmentRepository.count());
        stats.setTotalTickets(ticketRepository.count());
        
        stats.setNewTickets(ticketRepository.countByStatus("Open"));
        stats.setOpenTickets(ticketRepository.countByStatus("In Progress") + ticketRepository.countByStatus("Assigned"));
        stats.setResolved(ticketRepository.countByStatus("Resolved"));
        stats.setClosed(ticketRepository.countByStatus("Closed"));

        Map<String, Long> statusMap = new HashMap<>();
        statusMap.put("Open", ticketRepository.countByStatus("Open"));
        statusMap.put("Assigned", ticketRepository.countByStatus("Assigned"));
        statusMap.put("In Progress", ticketRepository.countByStatus("In Progress"));
        statusMap.put("Resolved", ticketRepository.countByStatus("Resolved"));
        statusMap.put("Closed", ticketRepository.countByStatus("Closed"));
        stats.setTicketStatusMap(statusMap);
        
        Map<String, Long> priorityMap = new HashMap<>();
        priorityMap.put("Low", ticketRepository.countByPriority("Low"));
        priorityMap.put("Medium", ticketRepository.countByPriority("Medium"));
        priorityMap.put("High", ticketRepository.countByPriority("High"));
        priorityMap.put("Critical", ticketRepository.countByPriority("Critical"));
        stats.setPriorityMap(priorityMap);
        
        stats.setRecentTickets(ticketRepository.findTop10ByOrderByCreatedDateDesc());

        return stats;
    }
}
