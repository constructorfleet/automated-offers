import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppService } from "./app.service";
import { setLogLevels } from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const service = await app.resolve(AppService);

  setLogLevels(app);
  await service.run();
}
bootstrap();
