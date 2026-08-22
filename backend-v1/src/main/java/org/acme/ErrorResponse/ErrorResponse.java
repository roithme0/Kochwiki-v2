package org.acme.ErrorResponse;

public class ErrorResponse {
    // #region fields

    private int statusCode;
    private String message;

    // #endregion

    // #region getters

    public int getStatusCode() {
        return statusCode;
    }

    public String getMessage() {
        return message;
    }

    // #endregion

    // #region constructors

    /**
     * @param statusCode status code of the error.
     * @param message    message of the error.
     */
    public ErrorResponse(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }

    // #endregion
}