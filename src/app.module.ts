import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { PublishCommand } from './cli/publish.command';
import { ArticlesService } from './services/articles/articles.service';
import { ConfigurationService } from './services/configuration/configuration.service';
import { CWD_PROVIDER } from './services/cwd/cwd.provider';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: path.resolve(process.cwd(), 'dev-to-git.env'),
    }),
  ],
  providers: [
    CWD_PROVIDER,
    ArticlesService,
    PublishCommand,
    ConfigurationService,
  ],
})
export class AppModule {}
