package com.rgreen.servicehub;

import com.rgreen.servicehub.model.Department;
import com.rgreen.servicehub.repository.DepartmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class ServiceHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceHubApplication.class, args);
    }

    @Bean
    public CommandLineRunner dataLoader(DepartmentRepository deptRepo) {
        return args -> {
            if (deptRepo.count() == 0) {
                Department it = new Department();
                it.setName("IT");
                it.setDescription("Information Technology");

                Department hr = new Department();
                hr.setName("HR");
                hr.setDescription("Human Resources");

                Department finance = new Department();
                finance.setName("Finance");
                finance.setDescription("Finance Department");

                Department ops = new Department();
                ops.setName("Operations");
                ops.setDescription("Operations Department");

                deptRepo.saveAll(List.of(it, hr, finance, ops));
            }
        };
    }
}
