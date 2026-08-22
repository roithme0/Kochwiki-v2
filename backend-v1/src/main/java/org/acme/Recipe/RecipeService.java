package org.acme.Recipe;

import java.util.Map;

import org.acme.ErrorResponse.ErrorResponse;
import org.jboss.logging.Logger;

import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;
import jakarta.transaction.Transactional;

@Path("/recipes")
public class RecipeService {
    private static final Logger LOG = Logger.getLogger(RecipeService.class);

    @Inject
    private RecipeResource recipeResource;

    @GET
    public Response findAll() {
        LOG.info("GET: finding all recipes ...");
        try {
            return Response.ok(recipeResource.listAll()).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                            "Unexpected error: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") final Long id) {
        LOG.info("GET: finding recipe by id '" + id + "' ...");
        try {
            Recipe recipe = recipeResource.findById(id);
            if (recipe == null) {
                return Response
                        .status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                "Recipe with id " + id + " does not exist"))
                        .build();
            }
            return Response.ok(recipe).build();
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
    public Response create(final Recipe recipe) {
        LOG.info("POST: creating recipe '" + recipe.name + "' ...");
        try {
            recipeResource.create(recipe);
            return Response.ok(recipe).build();
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
    @Path("/{id}")
    public Response patch(@PathParam("id") final Long id, final Map<String, Object> updates) {
        LOG.info("PATCH: patching recipe with id '" + id + "' ...");
        try {
            Recipe recipe = recipeResource.findById(id);
            if (recipe == null) {
                return Response
                        .status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                "Recipe with id " + id + " does not exist"))
                        .build();
            }
            Recipe updatedRecipe = recipeResource.patch(recipe, updates);
            return Response.ok(updatedRecipe).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                            "Unexpected error: " + e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Transactional
    @Path("/{id}")
    public Response delete(@PathParam("id") final Long id) {
        LOG.info("DELETE: deleting recipe with id '" + id + "' ...");
        try {
            Recipe entity = recipeResource.findById(id);
            recipeResource.delete(entity);
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
