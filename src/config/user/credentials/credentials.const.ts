export const OPCredentials: "1password" = "1password" as const;
export type OPCredentials = typeof OPCredentials;

export const BasicCredentials = "basic" as const;
export type BasicCredentials = typeof BasicCredentials;

export const Credentials = [BasicCredentials, OPCredentials] as const;
export type Credentials = (typeof Credentials)[number];
