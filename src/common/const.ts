export const VariableNamePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
export const VariableReplacerPattern = /{(?:[a-zA-Z][a-zA-Z0-9_]*.?)+}/;
export const VariableSegmentPattern =
  /(([a-zA-Z][a-zA-Z0-9_]*)|({[a-zA-Z][a-zA-Z0-9_]*}))/;
export const VariablePathPattern =
  /^(([a-zA-Z][a-zA-Z0-9_]*)|({(?:[a-zA-Z][a-zA-Z0-9_]*.?)+}))((\.[a-zA-Z][a-zA-Z0-9_]*)|(\.{(?:[a-zA-Z][a-zA-Z0-9_]*.?)+}))*$/;
export const ERROR_VARIABLE = "ERROR" as const;
export const ELEMENT_NOT_FOUND = "NOT_FOUND" as const;
export const SystemVariable = {
  USERS: "users" as const,
  USER: "user" as const,
  ACCOUNTS: "accounts" as const,
  ACCOUNT: "account" as const,
  DATE: "date" as const,
  OUTPUT: "output" as const,
};
