package com.smart_campus.smart_campus.ticket.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResourceDTO {
    private Long id;
    private String name;
    private String location;
}
