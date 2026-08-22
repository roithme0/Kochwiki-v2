package org.acme.Foodstuff;

import java.util.Map;

import org.acme.Recipe.Recipe;
import org.acme.Recipe.RecipeResource;
import org.acme.Ingredient.Ingredient;
import org.jboss.logging.Logger;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class FoodstuffResource implements PanacheRepository<Foodstuff> {
    private static final Logger LOG = Logger.getLogger(FoodstuffService.class);

    @Inject
    private RecipeResource recipeResource;

    /**
     * Patch a foodstuff with the given updates.
     * Update all fields except id.
     * 
     * @param foodstuff foodstuff to patch
     * @param updates   updates to apply
     * @return patched foodstuff
     */
    public Foodstuff patch(final Foodstuff foodstuff, final Map<String, Object> updates) {
        LOG.debug("updates: " + updates);
        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            switch (key) {
                case "name":
                    foodstuff.name = (String) value;
                    break;
                case "brand":
                    foodstuff.brand = (String) value;
                    break;
                case "unit":
                    foodstuff.setUnit((String) value);
                    break;
                case "kcal":
                    foodstuff.kcal = (value instanceof Number) ? ((Number) value).intValue() : null;
                    break;
                case "carbs":
                    foodstuff.carbs = (value instanceof Number) ? ((Number) value).floatValue() : null;
                    break;
                case "protein":
                    foodstuff.protein = (value instanceof Number) ? ((Number) value).floatValue() : null;
                    break;
                case "fat":
                    foodstuff.fat = (value instanceof Number) ? ((Number) value).floatValue() : null;
                    break;
                default:
                    throw new IllegalArgumentException("Unknown field '" + key + "'");
            }
        }

        updateNutritionalValuesOfRecipes(foodstuff);
        return foodstuff;
    }

    // #region utilities

    private void updateNutritionalValuesOfRecipes(Foodstuff foodstuff) {
        if (foodstuff.ingredients.size() == 0) {
            return;
        }

        for (Ingredient ingredient : foodstuff.ingredients) {
            Recipe recipe = recipeResource.updateNutritionalValues(ingredient.recipe);
            recipeResource.persist(recipe);
        }
    }

    // #endregion
}
