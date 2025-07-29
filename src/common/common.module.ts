import { Module } from '@nestjs/common';
import { GenericQueryService } from './services/generic-query.service';

@Module({
  providers: [GenericQueryService],
  exports: [GenericQueryService],
})
export class CommonModule {}
