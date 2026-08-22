package org.acme.ShoppingList;

import java.util.ArrayList;
import java.util.List;

import org.acme.ShoppingListItem.ShoppingListItemIngredient;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class ShoppingList extends PanacheEntityBase {
    // #region fields

    @Id
    public Long id;

    @OneToMany(mappedBy = "shoppingList", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference("shoppingList-shoppingListItemIngredients")
    public List<ShoppingListItemIngredient> shoppingListItemIngredients = new ArrayList<>();

    // #endregion

    // #region methods

    public void addIngredient(final ShoppingListItemIngredient newShoppingListItemIngredient) {
        shoppingListItemIngredients.add(newShoppingListItemIngredient);
        newShoppingListItemIngredient.shoppingList = this;
    }

    public void removeIngredient(final ShoppingListItemIngredient shoppingListItemIngredient) {
        shoppingListItemIngredients.remove(shoppingListItemIngredient);
        shoppingListItemIngredient.delete();
    }

    // #endregion

    // #region constructors

    /**
     * Default constructor for hibernate.
     */
    public ShoppingList() {
    }

    public ShoppingList(Long paramCustomUserId) {
        id = paramCustomUserId;
    }

    // #endregion
}
