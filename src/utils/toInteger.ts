export default (value: unknown): number | undefined => {
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }
  return undefined;
};
