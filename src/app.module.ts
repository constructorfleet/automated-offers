import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import {
  AccountConfigs,
  AccountsConfigModule,
  AppConfig,
  AppConfigModule,
  UserConfigs,
  UsersConfigModule,
} from "./config";
import { UserModule } from "./handlers";
import { LoggableService } from "./loggable.service";

@Module({
  imports: [
    AppConfigModule.forRoot("config", "app.yaml"),
    UsersConfigModule.forRoot("config", "users", UserConfigs),
    AccountsConfigModule.forRoot("config", "accounts", AccountConfigs),
    UserModule.forRoot(),
  ],
  providers: [AppService],
})
export class AppModule extends LoggableService {
  constructor(config: AppConfig) {
    super(config);
  }
}
