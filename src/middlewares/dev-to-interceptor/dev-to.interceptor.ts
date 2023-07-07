import {
  AxiosFulfilledInterceptor,
  AxiosInterceptor,
} from '@narando/nest-axios-interceptor';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosHeaders, type AxiosRequestConfig } from 'axios';
import {
  DEV_TO_TOKEN,
  DEV_TO_TOKEN_TYPE,
} from '../../data/dev-to/dev-to.tokens';

@Injectable()
export class DevToInterceptor extends AxiosInterceptor {
  constructor(
    httpService: HttpService,
    @Inject(DEV_TO_TOKEN) private devToToken: DEV_TO_TOKEN_TYPE,
  ) {
    super(httpService);
  }

  public requestFulfilled(): AxiosFulfilledInterceptor<AxiosRequestConfig> {
    return (config) => {
      if (config.baseURL.startsWith('https://dev.to/api')) {
        if (!config.headers) {
          config.headers = new AxiosHeaders({ 'api-key': this.devToToken });
        } else {
          config.headers['api-key'] = this.devToToken;
        }
      }

      return config;
    };
  }
}
