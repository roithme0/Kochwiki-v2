package org.acme.Recipe;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;

import java.util.ArrayList;
import java.util.List;
import java.net.URL;

import org.acme.Ingredient.Ingredient;
import org.acme.Step.Step;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
public class Recipe extends PanacheEntity {
    // #region consts

    static final int MAX_LENGTH_NAME = 200;
    static final int MAX_LENGTH_SERVINGS = 2;
    static final int MAX_LENGTH_PREPTIME = 3;
    static final int MAX_LENGTH_ORIGINNAME = 200;
    static final int MAX_LENGTH_ORIGINURL = 200;
    private static final int MAX_LENGTH_KCAL = 4;
    private static final int MAX_LENGTH_CARBS = 4;
    private static final int MAX_LENGTH_PROTEIN = 4;
    private static final int MAX_LENGTH_FAT = 4;

    // #endregion

    // #region fields

    @Column(unique = true, nullable = false, length = MAX_LENGTH_NAME)
    public String name;

    @Column(nullable = false, length = MAX_LENGTH_SERVINGS)
    public Integer servings;

    @Column(nullable = true, length = MAX_LENGTH_PREPTIME)
    public Integer preptime;

    @Column(nullable = true, length = MAX_LENGTH_ORIGINNAME)
    public String originName;

    @Column(nullable = true, length = MAX_LENGTH_ORIGINURL)
    public URL originUrl;

    /**
     * Nutritional value per serving
     */
    @Column(nullable = true, length = MAX_LENGTH_KCAL)
    public Integer kcal;

    /**
     * Nutritional value per serving
     */
    @Column(nullable = true, length = MAX_LENGTH_CARBS)
    public Float carbs;

    /**
     * Nutritional value per serving
     */
    @Column(nullable = true, length = MAX_LENGTH_PROTEIN)
    public Float protein;

    /**
     * Nutritional value per serving
     */
    @Column(nullable = true, length = MAX_LENGTH_FAT)
    public Float fat;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference("recipe-ingredients")
    public List<Ingredient> ingredients = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference("recipe-steps")
    public List<Step> steps = new ArrayList<>();

    // #endregion

    // #region setters

    public void setServings(final Integer newServings) {
        final int minServings = 1;
        final int maxServings = 99;

        if (newServings < minServings || newServings > maxServings) {
            throw new IllegalArgumentException(
                    String.format("Wert muss zwischen %d und %d liegen.", minServings, maxServings));
        }
        servings = newServings;
    }

    public void setPreptime(final Integer newPreptime) {
        final int minPreptime = 1;
        final int maxPreptime = 999;

        if (newPreptime == null) { // allow null values
            return;
        }
        if (newPreptime < minPreptime || newPreptime > maxPreptime) {
            throw new IllegalArgumentException(
                    String.format("Wert muss zwischen %d und %d liegen.", minPreptime, maxPreptime));
        }
        preptime = newPreptime;
    }

    public void setOriginUrl(final String newOriginUrl) {
        if (newOriginUrl == null || newOriginUrl == "") {
            originUrl = null;
            return;
        }

        try {
            originUrl = new URL(newOriginUrl);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid URL format for 'originUrl'", e);
        }
    }

    /**
     * Replace ingredients used in recipe.
     * 
     * @param newIngredients New list of ingredients.
     */
    public void setIngredients(final List<Ingredient> newIngredients) {
        List<Ingredient> oldIngredients = new ArrayList<>(ingredients);
        for (Ingredient ingredient : oldIngredients) {
            this.removeIngredient(ingredient);
        }
        for (Ingredient ingredient : newIngredients) {
            addIngredient(ingredient);
        }
    }

    public void addIngredient(final Ingredient newIngredient) {
        ingredients.add(newIngredient);
        newIngredient.recipe = this;
    }

    public void removeIngredient(final Ingredient ingredient) {
        ingredients.remove(ingredient);
        ingredient.recipe = null;
    }

    /**
     * Replace steps of recipe.
     * 
     * @param newSteps New list of steps.
     */
    public void setSteps(final List<Step> newSteps) {
        List<Step> oldSteps = new ArrayList<>(steps);
        for (Step step : oldSteps) {
            this.removeStep(step);
        }
        for (Step step : newSteps) {
            this.addStep(step);
        }
    }

    public void addStep(final Step newStep) {
        steps.add(newStep);
        newStep.recipe = this;
    }

    public void removeStep(final Step step) {
        steps.remove(step);
        step.recipe = null;
    }

    // #endregion

    // #region constructors

    /**
     * Default constructor for hibernate.
     */
    public Recipe() {
    }

    public Recipe(
            final String paramName,
            final Integer paramServings,
            final Integer paramPreptime,
            final String paramOriginName,
            final String paramOriginUrl,
            final List<Ingredient> paramIngredients,
            final List<Step> paramSteps) {
        this.name = paramName;
        this.setServings(paramServings);
        this.setPreptime(paramPreptime);
        this.originName = paramOriginName;
        this.setOriginUrl(paramOriginUrl);
        this.setIngredients(paramIngredients);
        this.setSteps(paramSteps);
    }

    // #endregion
}
