import fs from 'fs';
import { DEFAULT_CONFIG_PATH, DevToGit } from '../src/dev-to-git';

describe(`DevToGit`, () => {
  beforeEach(() => {
    process.argv = ['don-t-care', 'don-t-care'];
    process.env.DEV_TO_TOKEN = 'token';
  });

  describe(`Config`, () => {
    describe(`Get config`, () => {
      it(`should have by default a path "./dev-to-git.json"`, () => {
        const devToGit = new DevToGit();
        expect(devToGit.getConfigPath()).toBe(DEFAULT_CONFIG_PATH);
      });

      it(`should accept a "config" argument to change the path to the config`, () => {
        const CUSTOM_CONFIG_PATH: string = './custom/dev-to-git.json';
        process.argv = ['don-t-care', 'don-t-care', '--config', CUSTOM_CONFIG_PATH];
        const devToGit = new DevToGit();
        expect(devToGit.getConfigPath()).toBe(CUSTOM_CONFIG_PATH);
      });
    });

    describe(`Read config from file`, () => {
      it(`should have the original config file on which a "repository" object is added`, () => {
        process.argv = ['don-t-care', 'don-t-care', '--config', './test/dev-to-git.json'];

        const devToGit = new DevToGit();

        const configFile = devToGit.readConfigFile();

        expect(configFile).toHaveLength(1);

        expect(configFile[0]).toEqual({
          ...JSON.parse(fs.readFileSync('test/dev-to-git.json').toString())[0],
          repository: {
            name: 'dev-to-git',
            username: 'maxime1992',
          },
        });
      });
    });
  });
});
