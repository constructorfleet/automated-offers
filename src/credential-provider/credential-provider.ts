import {
  CredentialProviderConfig,
  CredentialProviderType,
  CredentialsConfig,
} from "src/config";

export type Credentials = {
  username?: string;
  password?: string;
  otp?: string;
};
export abstract class CredentialsProvider<
  Config extends CredentialProviderConfig<CredentialProviderType>,
  Params extends CredentialsConfig,
> {
  protected constructor(protected readonly config: Config) {}

  abstract getCredentials(args: Params): Promise<Credentials>;
}
