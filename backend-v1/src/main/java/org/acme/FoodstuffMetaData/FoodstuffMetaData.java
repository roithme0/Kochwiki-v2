package org.acme.FoodstuffMetaData;

import java.util.Map;
import java.util.HashMap;

public class FoodstuffMetaData {

    public static Map<String, String> getVerboseNames() {
        Map<String, String> verboseNames = new HashMap<>();
        verboseNames.put("name", "Name");
        verboseNames.put("brand", "Marke");
        verboseNames.put("unit", "Einheit");
        verboseNames.put("unitVerbose", "Einheit");
        verboseNames.put("kcal", "Kalorien");
        verboseNames.put("carbs", "Kohlenhydrate");
        verboseNames.put("protein", "Proteine");
        verboseNames.put("fat", "Fett");
        return verboseNames;
    }

    public static Map<String, String> getUnitChoices() {
        Map<String, String> unitChoices = new HashMap<>();
        unitChoices.put("G", "g");
        unitChoices.put("ML", "ml");
        unitChoices.put("PIECE", "Stk.");
        return unitChoices;
    }
}
