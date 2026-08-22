package org.acme.ShoppingList;

import java.util.Optional;
import java.util.Iterator;

import org.acme.ErrorResponse.ErrorResponse;
import org.acme.Ingredient.Ingredient;
import org.acme.Ingredient.IngredientResource;
import org.acme.ShoppingList.DTOs.AddIngredientsDTO;
import org.acme.ShoppingList.DTOs.RemoveIngredientsDTO;
import org.acme.ShoppingList.DTOs.SetIsCheckedIngredientDTO;
import org.acme.ShoppingList.DTOs.SetIsPinnedIngredientDTO;
import org.acme.ShoppingListItem.ShoppingListItemIngredient;
import org.acme.ShoppingListItem.ShoppingListItemIngredientResource;
import org.jboss.logging.Logger;

import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/shoppingLists")
public class ShoppingListService {
        private static final Logger LOG = Logger.getLogger(ShoppingListService.class);

        @Inject
        private ShoppingListResource shoppingListResource;

        @Inject
        private ShoppingListItemIngredientResource shoppingListItemIngredientResource;

        @Inject
        IngredientResource ingredientResource;

        @Inject
        EntityManager entityManager;

        @GET
        public Response listAll() {
                LOG.info("GET: list all shoppingLists ...");
                try {
                        return Response.ok(shoppingListResource.listAll()).build();
                } catch (Exception e) {
                        return Response
                                        .status(Response.Status.INTERNAL_SERVER_ERROR)
                                        .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                                                        "Unexpected error: " + e.getMessage()))
                                        .build();
                }
        }

        @GET
        @Path("/{customUserId}")
        public Response findByCustomUserId(@PathParam("customUserId") final Long customUserId) {
                LOG.info("GET: find shoppingList for customUser with id '" + customUserId + "' ...");
                try {
                        ShoppingList shoppingList = shoppingListResource.findById(customUserId);
                        if (shoppingList == null) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "ShoppingList for customUser with id '" + customUserId
                                                                                + "' not found"))
                                                .build();
                        }
                        return Response.ok(shoppingList).build();
                } catch (Exception e) {
                        return Response
                                        .status(Response.Status.INTERNAL_SERVER_ERROR)
                                        .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                                                        "Unexpected error: " + e.getMessage()))
                                        .build();
                }
        }

        @PATCH
        @Transactional
        @Path("/addIngredient")
        @Consumes(MediaType.APPLICATION_JSON)
        public Response addIngredient(AddIngredientsDTO addIngredientsDTO) {
                LOG.info("PATCH: adding ingredient with id '" + addIngredientsDTO.ingredientId
                                + "' to shoppingList ...");
                try {
                        ShoppingList shoppingList = shoppingListResource
                                        .findById(addIngredientsDTO.customUserId);
                        if (shoppingList == null) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "ShoppingList for customUser with id '"
                                                                                + addIngredientsDTO.customUserId
                                                                                + "' not found"))
                                                .build();
                        }
                        Ingredient ingredient = ingredientResource.findById(addIngredientsDTO.ingredientId);
                        if (ingredient == null) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "Ingredient with id '" + addIngredientsDTO.ingredientId
                                                                                + "' not found"))
                                                .build();
                        }
                        ShoppingListItemIngredient shoppingListItemIngredient = null;
                        try {
                                shoppingListItemIngredient = entityManager.createQuery(
                                                "SELECT shoppingListItemIngredient FROM ShoppingListItemIngredient shoppingListItemIngredient WHERE shoppingListItemIngredient.ingredient = :ingredient AND shoppingListItemIngredient.shoppingList = :shoppingList",
                                                ShoppingListItemIngredient.class)
                                                .setParameter("ingredient", ingredient)
                                                .setParameter("shoppingList", shoppingList)
                                                .getSingleResult();
                        } catch (Exception e) {
                                // ingredient not used in any shopping list
                                shoppingListItemIngredient = new ShoppingListItemIngredient(ingredient,
                                                addIngredientsDTO.amount);
                        }
                        shoppingList.addIngredient(shoppingListItemIngredient);
                        shoppingListItemIngredientResource.persist(shoppingListItemIngredient);
                        shoppingListResource.persist(shoppingList);
                        return Response.ok(shoppingList).build();
                } catch (Exception e) {
                        return Response
                                        .status(Response.Status.INTERNAL_SERVER_ERROR)
                                        .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                                                        "Unexpected error: " + e.getMessage()))
                                        .build();
                }
        }

        @PATCH
        @Transactional
        @Path("/removeIngredient")
        @Consumes(MediaType.APPLICATION_JSON)
        public Response removeIngredient(RemoveIngredientsDTO removeIngredientsDTO) {
                LOG.info(
                                "PATCH: removing ingredient with id '" + removeIngredientsDTO.ingredientId
                                                + "' from shoppingList ...");
                try {
                        ShoppingList shoppingList = shoppingListResource
                                        .findById(removeIngredientsDTO.customUserId);
                        if (shoppingList == null) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "ShoppingList for customUser with id '"
                                                                                + removeIngredientsDTO.customUserId
                                                                                + "' not found"))
                                                .build();
                        }
                        Ingredient ingredient = ingredientResource.findById(removeIngredientsDTO.ingredientId);
                        if (ingredient == null) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "Ingredient with id '"
                                                                                + removeIngredientsDTO.ingredientId
                                                                                + "' not found"))
                                                .build();
                        }
                        ShoppingListItemIngredient shoppingListItemIngredient = null;
                        try {
                                shoppingListItemIngredient = entityManager.createQuery(
                                                "SELECT shoppingListItemIngredient FROM ShoppingListItemIngredient shoppingListItemIngredient WHERE shoppingListItemIngredient.ingredient = :ingredient AND shoppingListItemIngredient.shoppingList = :shoppingList",
                                                ShoppingListItemIngredient.class)
                                                .setParameter("ingredient", ingredient)
                                                .setParameter("shoppingList", shoppingList)
                                                .getSingleResult();

                                shoppingList.removeIngredient(shoppingListItemIngredient);
                                shoppingListItemIngredientResource.persist(shoppingListItemIngredient);
                                shoppingListResource.persist(shoppingList);
                                return Response.ok(shoppingList).build();
                        } catch (Exception e) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "Ingredient with id '"
                                                                                + removeIngredientsDTO.ingredientId
                                                                                + "' not found in shoppingList"))
                                                .build();
                        }
                } catch (Exception e) {
                        return Response
                                        .status(Response.Status.INTERNAL_SERVER_ERROR)
                                        .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                                                        "Unexpected error: " + e.getMessage()))
                                        .build();
                }
        }

        @PATCH
        @Transactional
        @Path("/ingredientIsChecked")
        @Consumes(MediaType.APPLICATION_JSON)
        public Response setIsChecked(SetIsCheckedIngredientDTO setIsCheckedIngredientDTO) {
                LOG.info(
                                "PATCH: setting isChecked for itemIngredient with id '"
                                                + setIsCheckedIngredientDTO.itemIngredientId
                                                + "' of shoppingList ...");
                try {
                        ShoppingList shoppingList = shoppingListResource
                                        .findById(setIsCheckedIngredientDTO.customUserId);
                        if (shoppingList == null) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "ShoppingList for customUser with id '"
                                                                                + setIsCheckedIngredientDTO.customUserId
                                                                                + "' not found"))
                                                .build();
                        }
                        Optional<ShoppingListItemIngredient> shoppingListItemIngredientOptional = shoppingList.shoppingListItemIngredients
                                        .stream()
                                        .filter(itemIngredient -> itemIngredient.id
                                                        .equals(setIsCheckedIngredientDTO.itemIngredientId))
                                        .findFirst();
                        ShoppingListItemIngredient shoppingListItemIngredient = shoppingListItemIngredientOptional
                                        .orElse(null);
                        if (shoppingListItemIngredient == null) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "ShoppingListItemIngredient with id '"
                                                                                + setIsCheckedIngredientDTO.itemIngredientId
                                                                                + "' not found in shoppingList"))
                                                .build();
                        }
                        shoppingListItemIngredient.isChecked = setIsCheckedIngredientDTO.isChecked;
                        shoppingListItemIngredientResource.persist(shoppingListItemIngredient);
                        return Response.ok(shoppingListItemIngredient).build();
                } catch (Exception e) {
                        return Response
                                        .status(Response.Status.INTERNAL_SERVER_ERROR)
                                        .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                                                        "Unexpected error: " + e.getMessage()))
                                        .build();
                }
        }

        @PATCH
        @Transactional
        @Path("/ingredientIsPinned")
        @Consumes(MediaType.APPLICATION_JSON)
        public Response setIsPinned(SetIsPinnedIngredientDTO setIsPinnedIngredientDTO) {
                LOG.info(
                                "PATCH: setting isPinned for itemIngredient with id '"
                                                + setIsPinnedIngredientDTO.itemIngredientId
                                                + "' of shoppingList ...");
                try {
                        ShoppingList shoppingList = shoppingListResource
                                        .findById(setIsPinnedIngredientDTO.customUserId);
                        if (shoppingList == null) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "ShoppingList for customUser with id '"
                                                                                + setIsPinnedIngredientDTO.customUserId
                                                                                + "' not found"))
                                                .build();
                        }
                        Optional<ShoppingListItemIngredient> shoppingListItemIngredientOptional = shoppingList.shoppingListItemIngredients
                                        .stream()
                                        .filter(itemIngredient -> itemIngredient.id
                                                        .equals(setIsPinnedIngredientDTO.itemIngredientId))
                                        .findFirst();
                        ShoppingListItemIngredient shoppingListItemIngredient = shoppingListItemIngredientOptional
                                        .orElse(null);
                        if (shoppingListItemIngredient == null) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "ShoppingListItemIngredient with id '"
                                                                                + setIsPinnedIngredientDTO.itemIngredientId
                                                                                + "' not found in shoppingList"))
                                                .build();
                        }
                        shoppingListItemIngredient.isPinned = setIsPinnedIngredientDTO.isPinned;
                        shoppingListItemIngredientResource.persist(shoppingListItemIngredient);
                        return Response.ok(shoppingListItemIngredient).build();
                } catch (Exception e) {
                        return Response
                                        .status(Response.Status.INTERNAL_SERVER_ERROR)
                                        .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                                                        "Unexpected error: " + e.getMessage()))
                                        .build();
                }
        }

        @PATCH
        @Transactional
        @Path("/clearChecked")
        @Consumes(MediaType.APPLICATION_JSON)
        public Response clearChecked(Long customUserId) {
                LOG.info(
                                "PATCH: clearing checked items of shoppingList ...");
                try {
                        ShoppingList shoppingList = shoppingListResource
                                        .findById(customUserId);
                        if (shoppingList == null) {
                                return Response
                                                .status(Response.Status.NOT_FOUND)
                                                .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                                                "ShoppingList for customUser with id '"
                                                                                + customUserId
                                                                                + "' not found"))
                                                .build();
                        }
                        Iterator<ShoppingListItemIngredient> iterator = shoppingList.shoppingListItemIngredients
                                        .iterator();
                        while (iterator.hasNext()) {
                                ShoppingListItemIngredient itemIngredient = iterator.next();
                                if (itemIngredient.isChecked == true && itemIngredient.isPinned == false) {
                                        iterator.remove();
                                        itemIngredient.delete();
                                }
                        }
                        shoppingListResource.persist(shoppingList);
                        return Response.ok(shoppingList).build();
                } catch (Exception e) {
                        return Response
                                        .status(Response.Status.INTERNAL_SERVER_ERROR)
                                        .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                                                        "Unexpected error: " + e.getMessage()))
                                        .build();
                }
        }
}
