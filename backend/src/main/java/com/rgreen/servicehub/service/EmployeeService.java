package com.rgreen.servicehub.service;

import com.rgreen.servicehub.model.Employee;
import com.rgreen.servicehub.model.Role;
import com.rgreen.servicehub.model.User;
import com.rgreen.servicehub.repository.EmployeeRepository;
import com.rgreen.servicehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public List<Employee> searchEmployees(String query) {
        return employeeRepository
                .findByFirstNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    public Employee getById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    public Employee createEmployee(Employee employee) {

        // Validate required fields
        if (employee.getFirstName() == null || employee.getFirstName().trim().isEmpty()) {
            throw new RuntimeException("First name is required");
        }

        if (employee.getLastName() == null || employee.getLastName().trim().isEmpty()) {
            throw new RuntimeException("Last name is required");
        }

        if (employee.getEmail() == null || employee.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        if (employee.getPhone() == null || employee.getPhone().trim().isEmpty()) {
            throw new RuntimeException("Phone is required");
        }

        if (employee.getDepartment() == null || employee.getDepartment().trim().isEmpty()) {
            throw new RuntimeException("Department is required");
        }

        if (employee.getDesignation() == null || employee.getDesignation().trim().isEmpty()) {
            throw new RuntimeException("Designation is required");
        }

        if (employee.getPassword() == null || employee.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        // Check duplicate email
        if (userRepository.findByEmail(employee.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Generate Employee ID
        employee.setEmployeeId(generateEmployeeId());

        // Encode password
        String encodedPassword = passwordEncoder.encode(employee.getPassword());
        employee.setPassword(encodedPassword);

        // Save employee
        Employee savedEmployee = employeeRepository.save(employee);

        // Create login account
        User user = new User();
        user.setEmail(savedEmployee.getEmail());
        user.setPassword(encodedPassword);
        user.setFirstName(savedEmployee.getFirstName());
        user.setLastName(savedEmployee.getLastName());
        user.setPhone(savedEmployee.getPhone());
        user.setRole(Role.EMPLOYEE);
        user.setStatus(savedEmployee.getStatus());

        userRepository.save(user);

        return savedEmployee;
    }

    public Employee updateEmployee(Long id, Employee updated) {

        Employee existing = getById(id);

        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setDepartment(updated.getDepartment());
        existing.setDesignation(updated.getDesignation());
        existing.setStatus(updated.getStatus());
        existing.setAvailability(updated.getAvailability());

        return employeeRepository.save(existing);
    }

    public void deleteEmployee(Long id) {

        Employee employee = getById(id);

        userRepository.findByEmail(employee.getEmail())
                .ifPresent(userRepository::delete);

        employeeRepository.delete(employee);
    }

    private String generateEmployeeId() {

        String maxId = employeeRepository.findMaxEmployeeId();

        if (maxId == null) {
            return "EMP-1001";
        }

        int number = Integer.parseInt(maxId.substring(4));

        return "EMP-" + (number + 1);
    }
}