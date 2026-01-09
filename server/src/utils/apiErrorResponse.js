
class ApiError extends Error{
    constructor(statusCode,error = [],message ="something sent wrong",stack = ""){
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.message = message;
        if(stack){
            this.stack = stack;
        }
        Error.captureStackTrace(this,this.constructor); // ensures that class is not included in the error stack
    }
}

export  {ApiError};