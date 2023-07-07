import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { PublishCommand } from './cli/publish.command';
import { ArticlesService } from './data/dev-to/articles/articles.service';
import {
  CURRENT_WORKING_DIRECTORY,
  CURRENT_WORKING_DIRECTORY_TYPE,
} from './data/utils/files';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: path.resolve(process.cwd(), 'dev-to-git.env'),
    }),
  ],
  providers: [
    ArticlesService,
    PublishCommand,
    {
      provide: CURRENT_WORKING_DIRECTORY,
      useFactory: (): CURRENT_WORKING_DIRECTORY_TYPE => process.cwd(),
    },
  ],
})
export class AppModule {}
