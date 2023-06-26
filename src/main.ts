#!/usr/bin/env node

// the above is needed as we publish this as a global package
// https://stackoverflow.com/a/34354713/2398593

import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
