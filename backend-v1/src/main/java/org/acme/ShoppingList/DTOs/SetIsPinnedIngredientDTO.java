package org.acme.ShoppingList.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SetIsPinnedIngredientDTO {
    @JsonProperty("customUserId")
    public Long customUserId;

    @JsonProperty("itemIngredientId")
    public Long itemIngredientId;

    @JsonProperty("isPinned")
    public Boolean isPinned;
}
