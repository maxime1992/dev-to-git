import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PublishCommand } from './controllers/publish.command';
import { ArticlesService } from './data/dev-to/articles/articles.service';

@Module({
  imports: [HttpModule],
  providers: [AppService, ArticlesService, PublishCommand],
})
export class AppModule {}
