export type InverseCapitalize<S extends string> =
  S extends `${infer First}${infer Rest}` ? `${Lowercase<First>}${Rest}` : S;
