package org.acme.CustomUser;

import java.util.Map;

import org.jboss.logging.Logger;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CustomUserResource implements PanacheRepository<CustomUser> {
    private static final Logger LOG = Logger.getLogger(CustomUserService.class);

    /**
     * Patch a customUser with the given updates.
     * Update all fields except id.
     * 
     * @param customUser customUser to patch
     * @param updates    updates to apply
     * @return patched customUser
     */
    public CustomUser patch(final CustomUser customUser, final Map<String, Object> updates) {
        LOG.debug("updates: " + updates);
        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            switch (key) {
                case "username":
                    customUser.username = (String) value;
                    break;
                default:
                    throw new IllegalArgumentException("Unknown field '" + key + "'");
            }
        }
        return customUser;
    }
}
