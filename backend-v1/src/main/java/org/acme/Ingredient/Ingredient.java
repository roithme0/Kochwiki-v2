package org.acme.Ingredient;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;

import java.util.ArrayList;
import java.util.List;

import org.acme.Foodstuff.Foodstuff;
import org.acme.FoodstuffMetaData.UnitEnum;
import org.acme.Recipe.Recipe;
import org.acme.ShoppingListItem.ShoppingListItemIngredient;

@Entity
@Table(uniqueConstraints = {
        // @UniqueConstraint(columnNames = { "index", "recipe_id" }),
        @UniqueConstraint(columnNames = { "foodstuff_id", "recipe_id" })
})
public class Ingredient extends PanacheEntity {
    // #region consts

    private static final int MAX_INDEX = 2;
    private static final int MAX_AMOUNT = 4;

    // #endregion

    // #region fields

    @Column(nullable = false, length = MAX_INDEX)
    public Integer index;

    @Column(nullable = false, length = MAX_AMOUNT)
    public Float amount;

    @ManyToOne
    @JoinColumn
    public Foodstuff foodstuff;

    @ManyToOne
    @JoinColumn
    @JsonBackReference("recipe-ingredients")
    public Recipe recipe;

    @OneToMany(mappedBy = "ingredient", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference("ingredient-shoppingListItemIngredients")
    public List<ShoppingListItemIngredient> shoppingListItemIngredients = new ArrayList<>();

    // #endregion

    // #region getters

    public Long getRecipeId() {
        return recipe.id;
    }

    public String getName() {
        return foodstuff.name;
    }

    public String getBrand() {
        return foodstuff.brand;
    }

    public UnitEnum getUnit() {
        return foodstuff.unit;
    }

    public String getUnitVerbose() {
        return foodstuff.getUnitVerbose();
    }

    public Integer getKcal() {
        return foodstuff.kcal;
    }

    public Float getCarbs() {
        return foodstuff.carbs;
    }

    public Float getProtein() {
        return foodstuff.protein;
    }

    public Float getFat() {
        return foodstuff.fat;
    }

    // #endregion

    // #region setters

    public void setIndex(final Integer newIndex) {
        final int minIndex = 0;
        final int maxIndex = 100;

        if (newIndex <= minIndex || newIndex >= maxIndex) {
            throw new IllegalArgumentException(
                    String.format("Wert muss zwischen %d und %d liegen.", minIndex, maxIndex));
        }
        index = newIndex;
    }

    public void setAmount(final Float newAmount) {
        final int minAmount = 0;
        final int maxAmount = 10000;

        if (newAmount <= minAmount || newAmount >= maxAmount) {
            throw new IllegalArgumentException(
                    String.format("Wert muss zwischen %d und %d liegen.", minAmount, maxAmount));
        }
        amount = newAmount;
    }

    public void setFoodstuff(final Foodstuff newFoodstuff) {
        foodstuff = newFoodstuff;
        foodstuff.ingredients.add(this);
    }

    public void setFoodstuffId(final Long foodstuffId) {
        Foodstuff newFoodstuff = Foodstuff.findById(foodstuffId);
        if (newFoodstuff == null) {
            throw new IllegalArgumentException("Foodstuff with id " + foodstuffId + " does not exist");
        }
        setFoodstuff(newFoodstuff);
    }

    // #endregion

    // #region constructors

    /**
     * Default constructor for hibernate.
     */
    public Ingredient() {
    }

    public Ingredient(
            final Integer paramIndex,
            final Float paramAmount,
            final Long paramFoodstuffId,
            final Recipe paramRecipe) {
        this.setIndex(paramIndex);
        this.setAmount(paramAmount);
        this.setFoodstuffId(paramFoodstuffId);
        this.recipe = paramRecipe;
    }

    // #endregion
}
