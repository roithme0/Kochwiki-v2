package org.acme.ShoppingListItemMetaData;

import java.util.HashMap;
import java.util.Map;

public class ShoppingListItemMetaData {
    public static Map<String, String> getVerboseNames() {
        Map<String, String> verboseNames = new HashMap<>();
        verboseNames.put("name", "Name");
        verboseNames.put("brand", "Marke");
        verboseNames.put("amount", "Menge");
        verboseNames.put("unitVerbose", "Einheit");
        verboseNames.put("recipeName", "Rezept");
        return verboseNames;
    }
}
