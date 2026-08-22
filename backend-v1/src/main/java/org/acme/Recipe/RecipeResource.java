package org.acme.Recipe;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.acme.Foodstuff.Foodstuff;
import org.acme.Ingredient.Ingredient;
import org.acme.Ingredient.IngredientResource;
import org.acme.ShoppingList.ShoppingListResource;
import org.acme.Step.Step;
import org.acme.Step.StepResource;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

@ApplicationScoped
public class RecipeResource implements PanacheRepository<Recipe> {

    @Inject
    IngredientResource ingredientResource;

    @Inject
    StepResource stepResource;

    @Inject
    ShoppingListResource shoppingListResource;

    @Inject
    EntityManager entityManager;

    public Recipe create(Recipe recipe) {
        recipe = updateNutritionalValues(recipe);
        persist(recipe);
        return recipe;
    }

    /**
     * Patch a recipe with the given updates.
     * Update all fields except id.
     * Calcutlate nutriional values.
     * 
     * @param recipe  the recipe to patch
     * @param updates the updates to apply
     * @return patched recipe
     */
    public Recipe patch(Recipe recipe, final Map<String, Object> updates) {
        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            switch (key) {
                case "name":
                    recipe.name = (String) value;
                    break;
                case "servings":
                    recipe.servings = (value instanceof Number) ? ((Number) value).intValue() : null;
                    break;
                case "preptime":
                    recipe.preptime = (value instanceof Number) ? ((Number) value).intValue() : null;
                    break;
                case "originName":
                    recipe.originName = (String) value;
                    break;
                case "originUrl":
                    recipe.setOriginUrl((String) value);
                    break;
                case "ingredients":
                    List<LinkedHashMap<String, Object>> ingredientsList = (List<LinkedHashMap<String, Object>>) value;

                    // remove ingredient if not in updates
                    Iterator<Ingredient> iterator = recipe.ingredients.iterator();
                    while (iterator.hasNext()) {
                        Ingredient existingIngredient = iterator.next();
                        Boolean ingredientFound = false;

                        for (LinkedHashMap<String, Object> ingredientMap : ingredientsList) {
                            if (existingIngredient.foodstuff.id == ((Number) ingredientMap.get("foodstuffId"))
                                    .intValue()) {
                                ingredientFound = true;
                                break;
                            }
                        }

                        if (ingredientFound == false) {
                            Ingredient ingredientToRemove = existingIngredient;
                            shoppingListResource.removeIngredientFromAllShoppingLists(ingredientToRemove);
                            iterator.remove();
                        }
                    }

                    for (LinkedHashMap<String, Object> ingredientMap : ingredientsList) {
                        Boolean existingIngredientFound = false;

                        // patch ingredient if existing
                        for (Ingredient existingIngredient : recipe.ingredients) {
                            if (existingIngredient.foodstuff.id == ((Number) ingredientMap.get("foodstuffId"))
                                    .intValue()) {
                                ingredientResource.patch(existingIngredient, ingredientMap);
                                existingIngredientFound = true;
                            }
                        }

                        // create new ingredient if not existing
                        if (existingIngredientFound == false) {
                            Integer index = ((Number) ingredientMap.get("index")).intValue();
                            Float amount = ((Number) ingredientMap.get("amount")).floatValue();
                            Long foodstuffId = ((Number) ingredientMap.get("foodstuffId")).longValue();
                            Ingredient newIngredient = new Ingredient(index, amount, foodstuffId, recipe);
                            recipe.ingredients.add(newIngredient);
                        }
                    }
                    break;
                case "steps":
                    List<Step> newSteps = new ArrayList<Step>();
                    List<LinkedHashMap<String, Object>> stepsList = (List<LinkedHashMap<String, Object>>) value;
                    for (LinkedHashMap<String, Object> stepMap : stepsList) {
                        Integer index = ((Number) stepMap.get("index")).intValue();
                        String description = (String) stepMap.get("description");
                        Step newStep = new Step(index, description);
                        newSteps.add(newStep);
                    }
                    recipe.setSteps(newSteps);
                    break;
                default:
                    throw new IllegalArgumentException("Unknown field '" + key + "'");
            }
        }

        recipe = updateNutritionalValues(recipe);
        return recipe;
    }

    public Recipe updateNutritionalValues(Recipe recipe) {
        if (recipe.ingredients.size() == 0) {
            recipe.kcal = null;
            recipe.carbs = null;
            recipe.protein = null;
            recipe.fat = null;
            return recipe;
        }

        Integer newKcal = 0;
        Float newCarbs = 0f;
        Float newProtein = 0f;
        Float newFat = 0f;
        for (Ingredient ingredient : recipe.ingredients) {
            Foodstuff foodstuff = ingredient.foodstuff;
            newKcal = updateNutritionalValue(ingredient, foodstuff.kcal, newKcal);
            newCarbs = updateNutritionalValue(ingredient, foodstuff.carbs, newCarbs);
            newProtein = updateNutritionalValue(ingredient, foodstuff.protein, newProtein);
            newFat = updateNutritionalValue(ingredient, foodstuff.fat, newFat);
        }
        if (newKcal == null) {
            recipe.kcal = null;
        } else {
            recipe.kcal = newKcal / recipe.servings;
        }
        if (newCarbs == null) {
            recipe.carbs = null;
        } else {
            recipe.carbs = newCarbs / recipe.servings;
        }
        if (newProtein == null) {
            recipe.protein = null;
        } else {
            recipe.protein = newProtein / recipe.servings;
        }
        if (newFat == null) {
            recipe.fat = null;
        } else {
            recipe.fat = newFat / recipe.servings;
        }

        return recipe;
    }

    // #region utilities

    private Integer updateNutritionalValue(Ingredient ingredient, Integer nutritionalValueOfFoodstuff,
            Integer newNutritionalValueOfRecipe) {
        if (nutritionalValueOfFoodstuff == null || newNutritionalValueOfRecipe == null) {
            return null;
        }

        switch (ingredient.foodstuff.unit) {
            case G:
            case ML:
                newNutritionalValueOfRecipe += Math.round(ingredient.amount * nutritionalValueOfFoodstuff / 100);
                break;

            case PIECE:
                newNutritionalValueOfRecipe += Math.round(ingredient.amount * nutritionalValueOfFoodstuff);
                break;

            default:
                break;
        }

        return newNutritionalValueOfRecipe;
    }

    private Float updateNutritionalValue(Ingredient ingredient, Float nutritionalValueOfFoodstuff,
            Float newNutritionalValueOfRecipe) {
        if (nutritionalValueOfFoodstuff == null || newNutritionalValueOfRecipe == null) {
            return null;
        }

        switch (ingredient.foodstuff.unit) {
            case G:
            case ML:
                newNutritionalValueOfRecipe += ingredient.amount * nutritionalValueOfFoodstuff / 100;
                break;

            case PIECE:
                newNutritionalValueOfRecipe += ingredient.amount * nutritionalValueOfFoodstuff;
                break;

            default:
                break;
        }

        return newNutritionalValueOfRecipe;
    }

    // #endregion
}
