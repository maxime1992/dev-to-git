import { Injectable } from '@nestjs/common';
import { Configuration } from './configuration.interface';

@Injectable()
export class ConfigurationService {
  private configuration: Configuration | null = null;

  public set(configuration: Configuration) {
    if (!!this.configuration) {
      throw new Error(
        `Configuration has already been set and cannot be updated`,
      );
    }
    this.configuration = configuration;
  }

  public get(): Configuration {
    if (!this.configuration) {
      throw new Error(`Trying to read the configuration before setting it`);
    }
    return this.configuration;
  }
}
