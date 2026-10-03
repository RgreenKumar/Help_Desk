package com.rgreen.servicehub.dto;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class SetupCheckResponse {
    private boolean setupRequired;
}
