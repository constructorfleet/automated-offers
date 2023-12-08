import { SystemVariable, VariableReplacerPattern } from "./const";
import { VariableMap, isRecord } from "./types";

type TransformFn<TResult> = (value: unknown) => TResult;

const defaultTransformFn = <TResult>(value: unknown) => value as TResult;

const getNestedProperty = (
  source: Record<string, unknown>,
  path: string[]
): unknown | null =>
  path.reduce((source: Record<string, unknown> | null, segment: string) => {
    if (source !== null && source instanceof Object && segment in source) {
      return source[segment];
    }
    return null;
  }, source);

const setNestedProperty = (
  source: Record<string, Record<string, unknown> | unknown>,
  path: string[],
  value: unknown
): Record<string, unknown> => {
  const [segment, remainder] = [path[0], path.slice(1)];
  if (remainder.length === 0) {
    source[segment] = value;
  } else {
    const next = source[segment];
    if (isRecord(next)) {
      source[segment] = setNestedProperty(next, remainder, value);
    } else {
      source[segment] = setNestedProperty({}, remainder, value);
    }
  }
  return source;
};

export const getVariable = <TResult = string>(
  variablePath: string,
  variableMap: VariableMap,
  transformFn: TransformFn<TResult> = defaultTransformFn
): TResult | null => {
  const result = getNestedProperty(variableMap, variablePath.split("."));
  if (result === null) {
    return null;
  }
  return transformFn(result);
};

export const setVariable = (
  variablePath: string,
  value: unknown,
  variableMap: VariableMap
): VariableMap =>
  setNestedProperty(variableMap, variablePath.split("."), value);

export const replaceTemplatedString = (
  templatedString: string,
  variableMap: VariableMap,
  templateReplacers: Map<string, string> = undefined
): string => {
  return Object.entries(templateReplacers ?? {}).reduce(
    (result, [replacer, variableName]) =>
      result.replace(
        replacer,
        getVariable(variableMap[variableName], variableMap)
      ),
    templatedString
  );
};

export const resolveTemplateString = (
  template: string,
  variableMap: VariableMap
): string =>
  template.replaceAll(new RegExp(VariableReplacerPattern, "g"), (substring) => {
    return getVariable(substring.slice(1, -1), variableMap);
  });

export const cleanVariables = (variables: VariableMap) =>
  normalizeVariables(
    Object.fromEntries(
      Object.entries(variables).filter(
        ([key]) => !Object.keys(SystemVariable).includes(key)
      )
    )
  );

export const normalizeVariables = (variables: unknown) =>
  Array.isArray(variables)
    ? variables.map(normalizeVariables)
    : typeof variables === "object"
      ? Object.keys(variables).some((key) => /^[^\d]+$/.test(key))
        ? Object.fromEntries(
            Object.entries(variables).map(([key, value]) => [
              key,
              normalizeVariables(value),
            ])
          )
        : Array.from(Object.values(variables).map(normalizeVariables))
      : variables;
