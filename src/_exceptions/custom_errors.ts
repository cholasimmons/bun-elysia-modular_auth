import { HttpStatusEnum } from "elysia-http-status-code/status";

/**AuthenticationError
 * Authenticated User not found
 */
class AuthenticationError extends Error{
    readonly _tag = "AuthenticationError";
    status: number;

    constructor(public message: string, status: number = 401, cause?: string){
        super(message, { cause });
        this.status = status;
        this.name = this._tag;
    }
}

/**AuthorizationError
 * Authorization not granted
 */
class AuthorizationError extends Error{
    readonly _tag = "AuthorizationError";
    status: number;

    constructor(public message: string = "You do not have permission to perform this action", status: number = 403, cause?: string){
        super(message, { cause });
        this.name = this._tag;
        this.status = status;
        this.cause = cause;
    }
}

/** NotFoundError
 * Requested data not found
 */
class NotFoundError extends Error {
    readonly _tag = "NotFoundError";
    status: number;

    constructor(public message: string = "The requested resource was not found", status: number = 404, cause?: string) {
        super(message, { cause });
        this.status = status;
        this.name = this._tag;
    }
}

/** DatabaseError
 * Database related error
 */
class DatabaseError extends Error{
    readonly _tag = "DatabaseError";
    status: number;

    constructor(public message: string = "A persistence storage error occurred", status: number, cause?: string){
        super(message, { cause: cause })
        
        this.status = status;
        this.name = this._tag;
    }
}

/** FinancialError
 * Monetary/Coupons related error
 */
class FinancialError extends Error{
    readonly _tag = "FinancialError";
    status: number;

    constructor(public message: string = "Unable to process payment request", status: number = HttpStatusEnum.HTTP_402_PAYMENT_REQUIRED, cause?: string){
        super(message, { cause });
        this.status = status
    }
}

/** MessagingError
 * Message related error such as sending/receiving...
 */
class MessagingError extends Error{
    constructor(message: string, cause?: string){
        super(message);
        this.name = "MessagingError";
        this.cause = cause;
    }
}

/** ValidationError
 * Schema validation error
 */
class ValidationError extends Error {
    readonly _tag = "ValidationError";
    status: number;

    constructor(
        public message: string = "Input validation failed",
        status: number = HttpStatusEnum.HTTP_400_BAD_REQUEST,
        cause?: string
    ) {
        super(message, { cause: cause });
        this.status = status;
        this.name = this._tag;
    }
}

/** ThirdPartyServiceError
 * Errors related to external services
 */
class ThirdPartyServiceError extends Error {
    readonly _tag = "ThirdPartyServiceError";
    status: number;

    constructor(
        public message: string = "A third-party service is unavailable or returned an error",
        status: number = HttpStatusEnum.HTTP_503_SERVICE_UNAVAILABLE,
        cause?: string
    ) {
        super(message, { cause: cause });
        this.status = status;
        this.name = this._tag;
    }
}

/** ConflictError
 * For conflicts, such as duplicate records or invalid state transitions.
 */
class ConflictError extends Error {
    readonly _tag = "ConflictError";
    status: number;

    constructor(public message: string = "Conflict occurred with the current state of the resource", status: number = 409, cause?: string) {
        super(message, { cause });
        this.status = status;
        this.name = this._tag;
    }
}

/** RateLimitError
 * For handling rate-limiting scenarios (e.g., too many requests).
 */
class RateLimitError extends Error {
    readonly _tag = "RateLimitError";
    status: number;

    constructor(public message: string = "Too many requests. Please try again later", status: number = HttpStatusEnum.HTTP_429_TOO_MANY_REQUESTS, cause?: string) {
        super(message, { cause });
        this.status = status;
        this.name = this._tag;
    }
}

/** InternalServerError
 * For unexpected server errors.
 */
class InternalServerError extends Error {
    readonly _tag = "InternalServerError";
    status: number;

    constructor(public message: string = "An unexpected error occurred", status: number = 500, cause?: string) {
        super(message, { cause });
        this.status = status;
        this.name = this._tag;
    }
}

/** TimeoutError
 * For request or operation timeouts.
 */
class TimeoutError extends Error {
    readonly _tag = "TimeoutError";
    status: number;

    constructor(public message: string = "The operation timed out", status: number = 504, cause?: string) {
        super(message, { cause });
        this.status = status;
        this.name = this._tag;
    }
}

/** ServiceUnavailableError
 * For unavailable or overloaded internal services.
 */
class ServiceUnavailableError extends Error {
    readonly _tag = "ServiceUnavailableError";
    status: number;

    constructor(public message: string = "The service is temporarily unavailable", status: number = 503, cause?: string) {
        super(message, { cause });
        this.status = status;
        this.name = this._tag;
    }
}

/** PaymentRequiredError
 * For payment-related issues.
 */
class PaymentRequiredError extends Error {
    readonly _tag = "PaymentRequiredError";
    status: number;

    constructor(public message: string = "Payment is required to access this resource", status: number = HttpStatusEnum.HTTP_402_PAYMENT_REQUIRED, cause?: string) {
        super(message, { cause });
        this.status = status;
        this.name = this._tag;
    }
}




export {
    MessagingError,
    FinancialError,
    DatabaseError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    ThirdPartyServiceError,
    ConflictError,
    RateLimitError,
    InternalServerError,
    TimeoutError,
    ServiceUnavailableError,
    PaymentRequiredError
};