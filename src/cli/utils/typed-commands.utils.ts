import type { KebabCase } from 'literal-case';
import { Option } from 'nest-commander';

type InverseCapitalize<S extends string> =
  S extends `${infer First}${infer Rest}` ? `${Lowercase<First>}${Rest}` : S;

type RemapPropsAsOptions<CustomType> = {
  [k in keyof CustomType]: `option${Capitalize<string & k>}`;
}[keyof CustomType];

type PublishCommandOptionsCapitalized<T> = {
  [K in keyof T as `${Capitalize<string & K>}`]: boolean;
};

export type TypedCommandRunner<CustomType> = {
  [k in RemapPropsAsOptions<CustomType>]: (
    val: string,
  ) => k extends `option${string &
    infer U extends keyof PublishCommandOptionsCapitalized<CustomType>}`
    ? CustomType[InverseCapitalize<string & U> extends keyof CustomType
        ? InverseCapitalize<string & U>
        : never]
    : null;
};

export type TypeKeyToKebab<
  CustomType,
  K extends keyof CustomType,
> = K extends string ? KebabCase<K> : never;

export function typeSafeFlags<CustomType, T extends keyof CustomType>(
  command: `--${TypeKeyToKebab<CustomType, T>}`,
  ...others: string[]
): string {
  return command.concat(...others);
}

export function typeSafeDefaultValue<CustomType, T extends keyof CustomType>(
  val: CustomType[T],
): CustomType[T] {
  return val;
}

export interface OptionMetadata<CustomType, T extends keyof CustomType> {
  flags: [`--${TypeKeyToKebab<CustomType, T>}`, ...string[]];
  description?: string;
  defaultValue?: CustomType[T];
  required?: boolean;
  name?: string;
  choices?: string[] | true;
  env?: string;
}

export function TypedOption<CustomType, T extends keyof CustomType>(
  arg: OptionMetadata<CustomType, T>,
): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const { flags, defaultValue, ...others } = arg;

    const originalDecorator = Option({
      ...others,
      flags: flags.join(' '),
      defaultValue: defaultValue as any,
    });
    const decoratedMethod = originalDecorator(target, propertyKey, descriptor);

    return decoratedMethod;
  };
}
