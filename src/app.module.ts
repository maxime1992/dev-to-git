import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { PublishCommand } from './cli/publish.command';
import { ArticlesService } from './data/dev-to/articles/articles.service';
import { CWD_PROVIDER } from './services/cwd.provider';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: path.resolve(process.cwd(), 'dev-to-git.env'),
    }),
  ],
  providers: [ArticlesService, PublishCommand, CWD_PROVIDER],
})
export class AppModule {}
