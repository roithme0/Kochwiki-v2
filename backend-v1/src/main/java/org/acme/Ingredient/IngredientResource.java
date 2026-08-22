package org.acme.Ingredient;

import java.util.Map;

import org.acme.Foodstuff.Foodstuff;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class IngredientResource implements PanacheRepository<Ingredient> {
    public Ingredient patch(Ingredient ingredient, final Map<String, Object> updates) {
        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            switch (key) {
                case "amount":
                    ingredient.amount = (value instanceof Number) ? ((Number) value).floatValue() : null;
                    break;
                case "foodstuff":
                    ingredient.foodstuff = (Foodstuff) value;
                    break;
                default:
                    break;
            }
        }
        return ingredient;
    }
}
