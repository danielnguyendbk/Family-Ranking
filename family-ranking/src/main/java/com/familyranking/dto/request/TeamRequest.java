package com.familyranking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class TeamRequest {
    @NotBlank private String name;
    @NotNull  private Long gameId;
    private List<Long> memberIds;
}
