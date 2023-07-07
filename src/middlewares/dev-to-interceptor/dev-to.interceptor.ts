import {
  AxiosFulfilledInterceptor,
  AxiosInterceptor,
} from '@narando/nest-axios-interceptor';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosHeaders, type AxiosRequestConfig } from 'axios';
import { ConfigurationService } from '../../services/configuration/configuration.service';

@Injectable()
export class DevToInterceptor extends AxiosInterceptor {
  constructor(
    httpService: HttpService,
    private configurationService: ConfigurationService,
  ) {
    super(httpService);
  }

  public requestFulfilled(): AxiosFulfilledInterceptor<AxiosRequestConfig> {
    return (config) => {
      if (!config.baseURL) {
        throw new Error(`Intercepted a request which doens't have a base URL`);
      }

      if (config.baseURL.startsWith('https://dev.to/api')) {
        const devToToken = this.configurationService.get().devToToken;

        if (!config.headers) {
          config.headers = new AxiosHeaders({ 'api-key': devToToken });
        } else {
          config.headers['api-key'] = devToToken;
        }
      }

      return config;
    };
  }
}
