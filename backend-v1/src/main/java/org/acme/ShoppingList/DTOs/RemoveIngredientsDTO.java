package org.acme.ShoppingList.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RemoveIngredientsDTO {
    @JsonProperty("customUserId")
    public Long customUserId;

    @JsonProperty("ingredientId")
    public Long ingredientId;
}
