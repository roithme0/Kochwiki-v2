package org.acme.ShoppingListItemMetaData;

import org.acme.ErrorResponse.ErrorResponse;
import org.jboss.logging.Logger;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

@Path("/shopping-list-item-meta-data")
public class ShoppingListItemMetaDataService {
    private static final Logger LOG = Logger.getLogger(ShoppingListItemMetaDataService.class);

    @GET
    @Path("/verbose-names")
    public Response getVerboseNames() {
        LOG.info("GET: getting foodstuff verbose names ...");
        try {
            return Response.ok(ShoppingListItemMetaData.getVerboseNames()).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
                            "Unexpected error: " + e.getMessage()))
                    .build();
        }
    }
}
