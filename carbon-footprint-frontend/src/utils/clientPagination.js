export function paginate(items, page, pageSize) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.max(1, Number(pageSize) || 5);
  const start = (safePage - 1) * safeSize;
  return items.slice(start, start + safeSize);
}
