/**
 * ApiResponse.js
 * -----------------------------------------
 * Standardized success response envelope, matching the approved API
 * contract exactly:
 * {
 *   success, statusCode, message, data, meta: { pagination?, timestamp }
 * }
 */

class ApiResponse {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {*} data
   * @param {object|null} pagination
   */
  constructor(statusCode, message, data = null, pagination = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = {
      timestamp: new Date().toISOString(),
    };

    if (pagination) {
      this.meta.pagination = pagination;
    }
  }

  send(res) {
    return res.status(this.statusCode).json(this);
  }

  static ok(res, message, data, pagination) {
    return new ApiResponse(200, message, data, pagination).send(res);
  }

  static created(res, message, data) {
    return new ApiResponse(201, message, data).send(res);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;