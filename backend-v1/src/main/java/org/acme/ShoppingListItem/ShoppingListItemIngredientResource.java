package org.acme.ShoppingListItem;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ShoppingListItemIngredientResource implements PanacheRepository<ShoppingListItemIngredient> {
}
