package org.acme.ShoppingList.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SetIsCheckedIngredientDTO {
    @JsonProperty("customUserId")
    public Long customUserId;

    @JsonProperty("itemIngredientId")
    public Long itemIngredientId;

    @JsonProperty("isChecked")
    public Boolean isChecked;
}
