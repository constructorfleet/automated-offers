import { Transform } from "class-transformer";
const ensureArray = (value) => (Array.isArray(value) ? value : [value]);
export const EnsureArray = Transform(({ value }) => ensureArray(value));

export const EnsureUniqueArray = <T>(projection: (item) => T = undefined) =>
  Transform(({ value }) => {
    const array = ensureArray(value);
    let projectedArray =
      projection !== undefined
        ? array.map((i) => (i !== null ? projection(i) : i))
        : array;
    if (
      projectedArray.some((value, index, arr) => arr.indexOf(value) !== index)
    ) {
      throw new Error("Array must contain unique entries.");
    }
    return array;
  });
