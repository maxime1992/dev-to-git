import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesService } from './dev-to/articles/articles.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, ArticlesService],
})
export class AppModule {}
