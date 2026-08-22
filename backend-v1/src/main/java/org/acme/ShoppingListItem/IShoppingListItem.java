package org.acme.ShoppingListItem;

import org.acme.FoodstuffMetaData.UnitEnum;

public interface IShoppingListItem {
    Boolean getIsChecked();

    Boolean getIsPinned();

    String getName();

    String getBrand();

    Float getAmount();

    UnitEnum getUnit();

    String getUnitVerbose();

    Long getShoppingListId();
}
