package org.acme.Foodstuff;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

import org.acme.ErrorResponse.ErrorResponse;
import org.jboss.logging.Logger;

import java.util.Map;

@Path("/foodstuffs")
public class FoodstuffService {
    private static final Logger LOG = Logger.getLogger(FoodstuffService.class);

    @Inject
    private FoodstuffResource foodstuffResource;

    @GET
    public Response listAll() {
        LOG.info("GET: listing all foodstuffs ...");
        try {
            return Response.ok(foodstuffResource.listAll()).build();
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
        LOG.info("GET: find foodstuff with id '" + id + "' ...");
        try {
            Foodstuff foodstuff = foodstuffResource.findById(id);
            if (foodstuff == null) {
                return Response
                        .status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                "Foodstuff with id " + id + " not found"))
                        .build();
            }
            return Response.ok(foodstuff).build();
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
    public Response create(final Foodstuff foodstuff) {
        LOG.info("POST: creating foodstuff '" + foodstuff.name + "' ...");
        try {
            foodstuffResource.persist(foodstuff);
            return Response.ok(foodstuff).build();
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
        LOG.info("PATCH: patching foodstuff with id '" + id + "' ...");
        try {
            Foodstuff foodstuff = foodstuffResource.findById(id);
            if (foodstuff == null) {
                return Response
                        .status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                "Foodstuff with id " + id + " not found"))
                        .build();
            }
            Foodstuff updatedFoodstuff = foodstuffResource.patch(foodstuff, updates);
            return Response.ok(updatedFoodstuff).build();
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
        LOG.info("DELETE: deleting foodstuff with id '" + id + "' ...");
        try {
            Foodstuff foodstuff = foodstuffResource.findById(id);
            if (foodstuff == null) {
                return Response
                        .status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse(Response.Status.NOT_FOUND.getStatusCode(),
                                "Foodstuff with id " + id + " not found"))
                        .build();
            }
            foodstuff.delete();
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
