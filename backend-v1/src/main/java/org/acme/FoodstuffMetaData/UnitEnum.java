package org.acme.FoodstuffMetaData;

public enum UnitEnum {
    G("g"),
    ML("ml"),
    PIECE("Stk.");

    private final String unit;

    private UnitEnum(final String newUnit) { // needs to be private for some reason
        unit = newUnit;
    }

    public String getUnitVerbose() {
        return unit;
    }
}
