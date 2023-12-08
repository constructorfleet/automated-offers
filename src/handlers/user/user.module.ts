import { DynamicModule, Module } from "@nestjs/common";
import { AccountsModule } from "../account/account.module";
import { BrowserModule } from "../browser";
import { UserCredentialsModule } from "./credentials";
import { UserHandler } from "./user.handler";

@Module({})
export class UserModule {
  static forRoot(): DynamicModule {
    return {
      module: UserModule,
      imports: [
        BrowserModule.forRoot(),
        AccountsModule.forRoot(),
        UserCredentialsModule.forRoot(),
      ],
      providers: [UserHandler],
      exports: [UserHandler],
    };
  }
}
