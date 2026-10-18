// Error personalizado para manejar mensajes y códigos HTTP.
class AppError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = AppError;