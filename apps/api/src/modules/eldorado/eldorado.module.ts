import { Module } from "@nestjs/common";
import { EldoradoController } from "./eldorado.controller";
import { EldoradoService } from "./eldorado.service";

@Module({
  controllers: [EldoradoController],
  providers: [EldoradoService],
  exports: [EldoradoService],
})
export class EldoradoModule {}
