import { IsNotEmpty, IsString } from "class-validator";
import { CredentialProviderType } from "./credential-provider.const";

export abstract class CredentialProviderConfig<
  Type extends CredentialProviderType,
> {
  @IsString()
  @IsNotEmpty()
  abstract type: Type;
}
