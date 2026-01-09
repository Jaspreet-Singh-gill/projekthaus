//format of json data that is send when api request is made

class ApiResponse {
  constructor(statusCode, data, message, success) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
