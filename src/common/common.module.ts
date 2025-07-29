import { Module } from '@nestjs/common';
import { GenericQueryService } from './services/generic-query.service';
import { ResponseHelper } from './helpers/response.helper';

@Module({
  providers: [GenericQueryService, ResponseHelper],
  exports: [GenericQueryService, ResponseHelper],
})
export class CommonModule {}
