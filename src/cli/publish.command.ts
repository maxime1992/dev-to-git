import { ConfigService } from '@nestjs/config';
import { camelCase } from 'literal-case';
import { Command, CommandRunner } from 'nest-commander';
import { getEnvOptions } from './utils/environment-options.utils';
import { TypedCommandRunner, TypedOption } from './utils/typed-commands.utils';

interface PublishCommandOptions {
  devToToken?: string;
  repositoryUrl?: string;
  silent?: boolean;
}

@Command({
  name: 'publish',
  options: { isDefault: false },
})
export class PublishCommand
  extends CommandRunner
  implements TypedCommandRunner<PublishCommandOptions>
{
  constructor(private configService: ConfigService) {
    super();
  }

  async run(inputs: string[], options: PublishCommandOptions): Promise<void> {
    const optionsFromEnv = getEnvOptions<PublishCommandOptions>({
      DEV_TO_TOKEN: true,
      REPOSITORY_URL: true,
      SILENT: true,
    }).reduce((acc, e) => {
      if (!e) {
        return acc;
      }
      const a = this.configService.get(e);
      if (a !== null && a !== undefined) {
        acc[camelCase(e)] = a;
      }
      return acc;
    }, {} as Partial<PublishCommandOptions>);

    // merge conf from the command and the .env
    const config: PublishCommandOptions = {
      ...optionsFromEnv,
      ...options,
    };

    return;
  }

  @TypedOption<PublishCommandOptions, 'devToToken'>({
    flags: ['--dev-to-token', '<token>'],
    description: 'Token for publishing to dev.to',
  })
  optionDevToToken(val: string): string {
    return val;
  }

  @TypedOption<PublishCommandOptions, 'repositoryUrl'>({
    flags: ['--repository-url', '<url>'],
    description: 'Url of your repository you keep your articles in',
  })
  optionRepositoryUrl(val: string): string {
    return val;
  }

  @TypedOption<PublishCommandOptions, 'silent'>({
    flags: ['--silent', '<boolean>'],
    description: 'No console output',
    defaultValue: false,
  })
  optionSilent(val: string | boolean): boolean {
    return val === true || val === 'true';
  }
}
