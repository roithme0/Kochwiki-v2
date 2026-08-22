package org.acme.ShoppingList;

import org.acme.Ingredient.Ingredient;
import org.acme.ShoppingListItem.ShoppingListItemIngredient;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

@ApplicationScoped
public class ShoppingListResource implements PanacheRepository<ShoppingList> {

    @Inject
    EntityManager entityManager;

    public void removeIngredientFromAllShoppingLists(Ingredient ingredient) {
        for (ShoppingListItemIngredient item : ingredient.shoppingListItemIngredients) {
            ShoppingList shoppingList = item.shoppingList;
            shoppingList.shoppingListItemIngredients.remove(item);
        }
    }
}
