package org.acme.Foodstuff;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.UniqueConstraint;

import org.acme.FoodstuffMetaData.UnitEnum;
import org.acme.Ingredient.Ingredient;

import java.util.List;
import java.util.Objects;
import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = { "name", "brand" })
})
public class Foodstuff extends PanacheEntity {

    // #region consts

    private static final int MAX_LENGTH_NAME = 50;
    private static final int MAX_LENGTH_BRAND = 100;
    private static final int MAX_LENGTH_UNIT = 5;
    private static final int MAX_LENGTH_KCAL = 3;
    private static final int MAX_LENGTH_CARBS = 3;
    private static final int MAX_LENGTH_PROTEIN = 3;
    private static final int MAX_LENGTH_FAT = 3;

    // #endregion

    // #region fields

    @Column(nullable = false, length = MAX_LENGTH_NAME)
    public String name;

    @Column(nullable = true, length = MAX_LENGTH_BRAND)
    public String brand;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = MAX_LENGTH_UNIT)
    public UnitEnum unit;

    @Column(nullable = true, length = MAX_LENGTH_KCAL)
    public Integer kcal;

    @Column(nullable = true, length = MAX_LENGTH_CARBS)
    public Float carbs;

    @Column(nullable = true, length = MAX_LENGTH_PROTEIN)
    public Float protein;

    @Column(nullable = true, length = MAX_LENGTH_FAT)
    public Float fat;

    @OneToMany(mappedBy = "foodstuff", fetch = FetchType.EAGER)
    @JsonIgnore
    public List<Ingredient> ingredients = new ArrayList<>();

    // #endregion

    // #region getters

    public String getUnit() {
        return unit.name();
    }

    public String getUnitVerbose() {
        return unit.getUnitVerbose();
    }

    public List<Long> getRecipeIds() {
        List<Long> recipeIds = new ArrayList<>();
        for (Ingredient ingredient : ingredients) {
            recipeIds.add(ingredient.recipe.id);
        }
        return recipeIds;
    }

    // #endregion

    // #region setters

    public void setBrand(final String newBrand) {
        if (newBrand == "") {
            brand = null;
            return;
        }
        brand = newBrand;
    }

    public void setUnit(final String newUnit) {
        try {
            unit = UnitEnum.valueOf(newUnit);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Einheit muss 'G', 'ML' oder 'PIECE' sein.");
        }
    }

    public void setKcal(final Integer newKcal) {
        if (newKcal == null) {
            kcal = null;
            return;
        }
        this.checkNutritionalValue(newKcal);
        kcal = newKcal;
    }

    public void setCarbs(final Float newCarbs) {
        if (newCarbs == null) {
            carbs = null;
            return;
        }
        this.checkNutritionalValue(newCarbs);
        carbs = newCarbs;
    }

    public void setProtein(final Float newProtein) {
        if (newProtein == null) {
            protein = null;
            return;
        }
        this.checkNutritionalValue(newProtein);
        protein = newProtein;
    }

    public void setFat(final Float newFat) {
        if (newFat == null) {
            fat = null;
            return;
        }
        this.checkNutritionalValue(newFat);
        fat = newFat;
    }

    // #endregion

    // #region constructors

    /**
     * Default constructor for hibernate.
     */
    public Foodstuff() {
    }

    public Foodstuff(
            final String paramName,
            final String paramBrand,
            final String paramUnit,
            final Integer paramKcal,
            final Float paramCarbs,
            final Float paramProtein,
            final Float paramFat) {
        this.name = paramName;
        this.setBrand(paramBrand);
        this.setUnit(paramUnit);
        this.setKcal(paramKcal);
        this.setCarbs(paramCarbs);
        this.setProtein(paramProtein);
        this.setFat(paramFat);
    }

    // #endregion

    // #region equals and hashCode

    @Override
    public boolean equals(final Object obj) {
        if (obj == this) {
            return true;
        }
        if (!(obj instanceof Foodstuff)) {
            return false;
        }
        Foodstuff foodstuff = (Foodstuff) obj;
        return Objects.equals(name, foodstuff.name)
                && Objects.equals(brand, foodstuff.brand)
                && Objects.equals(unit, foodstuff.unit)
                && Objects.equals(kcal, foodstuff.kcal)
                && Objects.equals(carbs, foodstuff.carbs)
                && Objects.equals(protein, foodstuff.protein)
                && Objects.equals(fat, foodstuff.fat);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, brand, unit, kcal, carbs, protein, fat);
    }

    // #endregion

    // #region utilities

    private void checkNutritionalValue(final float newValue) {
        final double minValue = 0;
        final double maxValue = 1000;

        if (newValue < minValue || newValue >= maxValue) {
            throw new IllegalArgumentException(
                    String.format("Wert muss zwischen %d und %d liegen.", minValue, maxValue));
        }
    }

    // #endregion
}
