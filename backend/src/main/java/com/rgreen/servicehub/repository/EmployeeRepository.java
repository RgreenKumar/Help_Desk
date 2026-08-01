package com.rgreen.servicehub.repository;
import com.rgreen.servicehub.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByFirstNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String firstName, String email);
    
    @Query("SELECT MAX(e.employeeId) FROM Employee e")
    String findMaxEmployeeId();
}
