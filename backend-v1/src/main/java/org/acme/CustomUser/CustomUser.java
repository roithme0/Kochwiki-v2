package org.acme.CustomUser;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class CustomUser extends PanacheEntity {
    // #region consts

    private static final int MAX_LENGTH_USERNAME = 50;

    // #endregion

    // #region fields

    @Column(unique = true, nullable = false, length = MAX_LENGTH_USERNAME)
    public String username;

    // #endregion

    // #region constructors

    /**
     * Default constructor for hibernate.
     */
    public CustomUser() {
    }

    /**
     * @param paramUsername username of the customUser.
     */
    public CustomUser(
            final String paramUsername) {
        this.username = paramUsername;
    }

    // #endregion
}
