package org.acme.Meta;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/meta")
public class MetaService {
    private static final Logger LOG = Logger.getLogger(MetaService.class);

    @ConfigProperty(name = "quarkus.application.version", defaultValue = "unknown")
    String version;

    @GET
    @Path("/version")
    public String getVersion() {
        LOG.info("GET: fetching version ...");
        return version;
    }
}
