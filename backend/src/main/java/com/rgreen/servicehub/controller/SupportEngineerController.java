package com.rgreen.servicehub.controller;

import com.rgreen.servicehub.model.SupportEngineer;
import com.rgreen.servicehub.service.SupportEngineerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/engineers")
public class SupportEngineerController {

    @Autowired
    private SupportEngineerService supportEngineerService;

    @GetMapping
    public ResponseEntity<List<SupportEngineer>> getAllEngineers(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(supportEngineerService.searchEngineers(search));
        }
        return ResponseEntity.ok(supportEngineerService.getAllEngineers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportEngineer> getEngineerById(@PathVariable Long id) {
        return ResponseEntity.ok(supportEngineerService.getById(id));
    }

    @PostMapping
    public ResponseEntity<SupportEngineer> createEngineer(@RequestBody SupportEngineer engineer) {
        return ResponseEntity.ok(supportEngineerService.createEngineer(engineer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupportEngineer> updateEngineer(@PathVariable Long id, @RequestBody SupportEngineer engineer) {
        return ResponseEntity.ok(supportEngineerService.updateEngineer(id, engineer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEngineer(@PathVariable Long id) {
        supportEngineerService.deleteEngineer(id);
        return ResponseEntity.ok().build();
    }
}
