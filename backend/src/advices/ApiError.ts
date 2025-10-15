class ApiError{
    statusCode: number;
    message: string;
    errors?: Record<string, string> ;

    constructor(statusCode: number, message: string, errors?: Record<string, string>) {
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
    }
}

export default ApiError;