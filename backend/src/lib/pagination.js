export function getPaginationParams({ page, limit }) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export function paginatedResponse(items, pagination) {
  return {
    data: items,
    pagination: buildPaginationMeta(pagination),
  };
}
