package org.acme.Ingredient;

import org.acme.ErrorResponse.ErrorResponse;
import org.jboss.logging.Logger;

import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;

@Path("/ingredients")
public class IngredientService {
    private static final Logger LOG = Logger.getLogger(IngredientService.class);

    @Inject
    private IngredientResource ingredientResource;

    @GET
    public Response listAll() {
        LOG.info("GET: listing all ingredients ...");
        try {
            return Response.ok(ingredientResource.listAll()).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                            "Unexpected error: " + e.getMessage()))
                    .build();
        }
    }
}
