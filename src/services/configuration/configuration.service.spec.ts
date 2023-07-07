import { Test, TestingModule } from '@nestjs/testing';
import { Configuration } from './configuration.interface';
import { ConfigurationService } from './configuration.service';

const getDefaultConf = (): Configuration => ({
  devToToken: 'mock-token',
  repositoryUrl: 'mock-repository-url',
  silent: false,
});

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigurationService],
    }).compile();

    service = module.get(ConfigurationService);
  });

  describe('set', () => {
    it(`should set the configuration the first time`, async () => {
      expect(() => service.set(getDefaultConf())).not.toThrow();
    });

    it(`should throw if the configuration is set more than once`, async () => {
      expect(() => service.set(getDefaultConf())).not.toThrow();
      expect(() => service.set(getDefaultConf())).toThrow(
        `Configuration has already been set and cannot be updated`,
      );
    });
  });

  describe('get', () => {
    it(`should throw if the configuration hasn't been set yet`, async () => {
      expect(() => service.get()).toThrow(
        `Trying to read the configuration before setting it`,
      );
    });

    it(`should should return the configuration if it's been set correctly`, async () => {
      service.set(getDefaultConf());
      expect(service.get()).toEqual(getDefaultConf());
    });
  });
});
