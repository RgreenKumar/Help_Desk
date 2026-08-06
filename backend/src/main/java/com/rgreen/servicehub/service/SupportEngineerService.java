package com.rgreen.servicehub.service;

import com.rgreen.servicehub.model.SupportEngineer;
import com.rgreen.servicehub.repository.SupportEngineerRepository;
import com.rgreen.servicehub.model.User;
import com.rgreen.servicehub.model.Role;
import com.rgreen.servicehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupportEngineerService {

    @Autowired
    private SupportEngineerRepository supportEngineerRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    public List<SupportEngineer> getAllEngineers() {
        return supportEngineerRepository.findAll();
    }

    public List<SupportEngineer> searchEngineers(String query) {
        return supportEngineerRepository.findByFirstNameContainingIgnoreCase(query);
    }

    public SupportEngineer getById(Long id) {
        return supportEngineerRepository.findById(id).orElseThrow(() -> new RuntimeException("Engineer not found"));
    }

    public SupportEngineer createEngineer(SupportEngineer engineer) {

    if (userRepository.findByEmail(engineer.getEmail()).isPresent()) {
        throw new RuntimeException("Email already registered");
    }

    engineer.setEngineerId(generateEngineerId());

    String rawPassword = engineer.getPassword();
    String encodedPassword = passwordEncoder.encode(rawPassword);

    engineer.setPassword(encodedPassword);

    SupportEngineer savedEngineer =
            supportEngineerRepository.save(engineer);

    User user = new User();

    user.setEmail(engineer.getEmail());
    user.setPassword(encodedPassword);
    user.setFirstName(engineer.getFirstName());
    user.setLastName(engineer.getLastName());
    user.setPhone(engineer.getPhone());
    user.setRole(Role.SUPPORT_ENGINEER);
    user.setStatus(engineer.getStatus());

    userRepository.save(user);

    return savedEngineer;
    }

    public SupportEngineer updateEngineer(Long id, SupportEngineer updated) {
        SupportEngineer existing = getById(id);
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setDepartment(updated.getDepartment());
        existing.setSpecialization(updated.getSpecialization());
        existing.setStatus(updated.getStatus());
        existing.setAvailability(updated.getAvailability());
        if (updated.getPassword() != null && !updated.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(updated.getPassword()));
        }
        return supportEngineerRepository.save(existing);
    }

    public void deleteEngineer(Long id) {
        SupportEngineer engineer = getById(id);

        userRepository.findByEmail(engineer.getEmail())
                .ifPresent(userRepository::delete);

        supportEngineerRepository.delete(engineer);
    }

    private String generateEngineerId() {
        String maxId = supportEngineerRepository.findMaxEngineerId();
        if (maxId == null) {
            return "ENG-S001";
        }
        int num = Integer.parseInt(maxId.substring(5));
        return String.format("ENG-S%03d", num + 1);
    }
}