import { ConstantCase } from 'literal-case';

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
