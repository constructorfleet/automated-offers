import { DynamicModule, Module } from "@nestjs/common";
import { CredentialsProviderModule } from "src/credential-provider";
import { UserCredentialsService } from "./user-credentials.service";

@Module({})
export class UserCredentialsModule {
  static forRoot(): DynamicModule {
    return {
      module: UserCredentialsModule,
      imports: [CredentialsProviderModule.forRoot()],
      providers: [UserCredentialsService],
      exports: [UserCredentialsService],
    };
  }
}
