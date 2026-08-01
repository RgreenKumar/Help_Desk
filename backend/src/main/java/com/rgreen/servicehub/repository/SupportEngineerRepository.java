package com.rgreen.servicehub.repository;

import com.rgreen.servicehub.model.SupportEngineer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SupportEngineerRepository extends JpaRepository<SupportEngineer, Long> {

    List<SupportEngineer> findByFirstNameContainingIgnoreCase(String firstName);

    Optional<SupportEngineer> findByEmail(String email);

    @Query("SELECT MAX(s.engineerId) FROM SupportEngineer s")
    String findMaxEngineerId();
}