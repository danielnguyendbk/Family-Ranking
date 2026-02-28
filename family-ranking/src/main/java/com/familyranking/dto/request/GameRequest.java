package com.familyranking.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GameRequest {
    @NotBlank private String name;
    private String description;
    private int winPoint  = 3;
    private int drawPoint = 1;
    private int lossPoint = 0;
    private boolean teamGame;
}
