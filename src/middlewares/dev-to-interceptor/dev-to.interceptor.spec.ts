import { AxiosFulfilledInterceptor } from '@narando/nest-axios-interceptor';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import type { AxiosRequestConfig } from 'axios';
import { DEV_TO_TOKEN } from '../../data/dev-to/dev-to.tokens';
import { DevToInterceptor } from './dev-to.interceptor';

describe('DevTo interceptor', () => {
  let service: DevToInterceptor;

  const MOCK_DEV_TO_TOKEN = 'mock-token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: HttpService, useValue: jest.fn() },
        { provide: DEV_TO_TOKEN, useValue: MOCK_DEV_TO_TOKEN },
        DevToInterceptor,
      ],
    }).compile();

    service = module.get(DevToInterceptor);
  });

  describe('requestFulfilled', () => {
    let configCallback: AxiosFulfilledInterceptor<AxiosRequestConfig>;

    beforeEach(() => {
      configCallback = service.requestFulfilled();
    });

    it(`should not add any api-key header if the request isn't for dev.to API`, async () => {
      expect(
        (await configCallback({ baseURL: 'http://test.com' })).headers?.[
          'api-key'
        ],
      ).toBeUndefined();
    });

    it(`should add an api-key header if the request is for dev.to API`, async () => {
      expect(
        (await configCallback({ baseURL: 'https://dev.to/api' })).headers?.[
          'api-key'
        ],
      ).toBe(MOCK_DEV_TO_TOKEN);
      expect(
        (await configCallback({ baseURL: 'https://dev.to/api/anything/else' }))
          .headers?.['api-key'],
      ).toBe(MOCK_DEV_TO_TOKEN);
    });
  });
});
