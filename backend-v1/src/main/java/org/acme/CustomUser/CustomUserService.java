package org.acme.CustomUser;

import java.util.Map;

import org.acme.ErrorResponse.ErrorResponse;
import org.acme.ShoppingList.ShoppingList;
import org.acme.ShoppingList.ShoppingListResource;
import org.jboss.logging.Logger;

import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

@Path("/users")
public class CustomUserService {
    private static final Logger LOG = Logger.getLogger(CustomUserService.class);

    @Inject
    private CustomUserResource userResource;

    @Inject
    private ShoppingListResource shoppingListResource;

    @Inject
    EntityManager entityManager;

    @GET
    @Path("/{username}")
    public Response findByUsername(@PathParam("username") final String username) {
        LOG.info("GET: find customUser with username '" + username + "' ...");
        try {
            CustomUser customUser = entityManager
                    .createQuery("SELECT customUser FROM CustomUser customUser WHERE customUser.username = :username",
                            CustomUser.class)
                    .setParameter("username", username)
                    .getSingleResult();
            if (customUser == null) {
                return Response
                        .status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                "CustomUser with username " + username + " not found"))
                        .build();
            }
            return Response.ok(customUser).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                            "Unexpected error: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    public Response listAll() {
        LOG.info("GET: listing all users ...");
        try {
            return Response.ok(userResource.listAll()).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                            "Unexpected error: " + e.getMessage()))
                    .build();
        }
    }

    @POST
    @Transactional
    public Response create(final CustomUser customUser) {
        LOG.info("POST: creating customUser '" + customUser.username + "' ...");
        try {
            userResource.persist(customUser);
            ShoppingList shoppingList = new ShoppingList(customUser.id);
            shoppingListResource.persist(shoppingList);
            return Response.ok(customUser).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                            "Unexpected error: " + e.getMessage()))
                    .build();
        }
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    public Response patch(@PathParam("id") final Long id, final Map<String, Object> updates) {
        LOG.info("PATCH: patching customUser with id '" + id + "' ...");
        try {
            CustomUser customUser = userResource.findById(id);
            if (customUser == null) {
                return Response
                        .status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                "CustomUser with id " + id + " not found"))
                        .build();
            }
            CustomUser updatedUser = userResource.patch(customUser, updates);
            return Response.ok(updatedUser).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                            "Unexpected error: " + e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") final Long id) {
        LOG.info("DELETE: deleting customUser with id '" + id + "' ...");
        try {
            CustomUser customUser = userResource.findById(id);
            if (customUser == null) {
                return Response
                        .status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                "CustomUser with id " + id + " not found"))
                        .build();
            }
            customUser.delete();
            return Response.ok().build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                            "Unexpected error: " + e.getMessage()))
                    .build();
        }
    }
}
