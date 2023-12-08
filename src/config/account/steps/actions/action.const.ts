export const StepActionType = "step" as const;
export type StepActionType = typeof StepActionType;
export const TextActionType = "text" as const;
export type TextActionType = typeof TextActionType;
export const SendKeysActionType = "sendkeys" as const;
export type SendKeysActionType = typeof SendKeysActionType;
export const ClickActionType = "click" as const;
export type ClickActionType = typeof ClickActionType;

export const Actions = [
  ClickActionType,
  SendKeysActionType,
  StepActionType,
  TextActionType,
] as const;
export type Actions = (typeof Actions)[number];
