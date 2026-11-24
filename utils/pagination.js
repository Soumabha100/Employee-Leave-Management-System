const AppError = require('./AppError');
const { PAGINATION } = require('../config/constants');

/**
 * Parses and validates pagination parameters from request query.
 *
 * @param {object} [query={}] - Express req.query object.
 * @returns {{page: number, limit: number, skip: number}} Parsed pagination settings.
 * @throws {AppError} 400 if page or limit is invalid (non-integer string, negative, decimal, array, object, or out of bounds).
 */
const parsePagination = (query = {}) => {
  let page = PAGINATION.DEFAULT_PAGE;
  let limit = PAGINATION.DEFAULT_LIMIT;

  if (query.page !== undefined) {
    if (typeof query.page !== 'string' || !/^\d+$/.test(query.page)) {
      throw new AppError("Query parameter 'page' must be a positive integer", 400);
    }
    const parsedPage = parseInt(query.page, 10);
    if (parsedPage < 1) {
      throw new AppError("Query parameter 'page' must be at least 1", 400);
    }
    page = parsedPage;
  }

  if (query.limit !== undefined) {
    if (typeof query.limit !== 'string' || !/^\d+$/.test(query.limit)) {
      throw new AppError("Query parameter 'limit' must be an integer between 1 and 100", 400);
    }
    const parsedLimit = parseInt(query.limit, 10);
    if (parsedLimit < 1 || parsedLimit > PAGINATION.MAX_LIMIT) {
      throw new AppError(`Query parameter 'limit' must be between 1 and ${PAGINATION.MAX_LIMIT}`, 400);
    }
    limit = parsedLimit;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Builds metadata object for paginated responses.
 *
 * @param {number} total - Total number of matching documents.
 * @param {number} page - Current page number.
 * @param {number} limit - Number of items per page.
 * @returns {{total: number, totalPages: number, currentPage: number, hasNextPage: boolean, hasPreviousPage: boolean}} Pagination metadata.
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

/**
 * Parses and validates sort parameters from request query against an allow-list.
 *
 * @param {object} [query={}] - Express req.query object.
 * @param {string[]} allowedFields - Array of allowed field names for sorting.
 * @param {string} defaultField - Default sort field if not specified in query.
 * @param {string} [defaultOrder='desc'] - Default sort order ('asc' or 'desc').
 * @returns {{sortBy: string, order: string, sort: object}} Sort configuration with MongoDB sort object.
 * @throws {AppError} 400 if sortBy is not in allowedFields or order is not 'asc' or 'desc'.
 */
const parseSort = (query = {}, allowedFields, defaultField, defaultOrder = 'desc') => {
  let sortBy = defaultField;
  let order = defaultOrder.toLowerCase();

  if (query.sortBy !== undefined) {
    if (typeof query.sortBy !== 'string' || !allowedFields.includes(query.sortBy)) {
      throw new AppError(
        `Invalid sortBy field '${query.sortBy}'. Allowed fields: ${allowedFields.join(', ')}`,
        400
      );
    }
    sortBy = query.sortBy;
  }

  if (query.order !== undefined) {
    if (typeof query.order !== 'string') {
      throw new AppError("Sort order must be 'asc' or 'desc'", 400);
    }
    const normalizedOrder = query.order.toLowerCase();
    if (normalizedOrder !== 'asc' && normalizedOrder !== 'desc') {
      throw new AppError("Sort order must be 'asc' or 'desc'", 400);
    }
    order = normalizedOrder;
  }

  const sortValue = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortValue };

  return { sortBy, order, sort };
};

module.exports = {
  parsePagination,
  buildPaginationMeta,
  parseSort,
};
