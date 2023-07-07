import { ConstantCase } from 'literal-case';
import { Configuration } from '../../services/configuration/configuration.interface';
import { PublishCommandOptions } from './publish-command.interface';

type EnvOptions<CustomType> = {
  [K in keyof CustomType]: ConstantCase<K & string>;
}[keyof CustomType];

export type EnvOptionsDictionary<CustomType> = Record<
  EnvOptions<CustomType>,
  true
>;

export const getEnvOptions = <CustomType>(
  a: EnvOptionsDictionary<CustomType>,
) => Object.keys(a) as EnvOptions<CustomType>[];

export function fromPublishCommandOptionsToConfiguration(
  publishCommandOptions: PublishCommandOptions,
): Configuration {
  if (!publishCommandOptions.devToToken) {
    throw new Error(`The dev.to token was not provided`);
  }

  if (!publishCommandOptions.repositoryUrl) {
    throw new Error(`The repository URL was not provided`);
  }

  return {
    devToToken: publishCommandOptions.devToToken,
    repositoryUrl: publishCommandOptions.repositoryUrl,
    silent: publishCommandOptions.silent ?? false,
  };
}
