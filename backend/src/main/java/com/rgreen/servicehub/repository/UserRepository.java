package com.rgreen.servicehub.repository;
import com.rgreen.servicehub.model.User;
import com.rgreen.servicehub.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByRole(Role role);
}
