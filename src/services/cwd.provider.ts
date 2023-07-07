export const CWD = Symbol('CWD');
export type CWD_TYPE = string;

export const CWD_PROVIDER = {
  provide: CWD,
  useFactory: (): CWD_TYPE => process.cwd(),
};
