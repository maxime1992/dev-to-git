import { ConfigService } from '@nestjs/config';
import { Command, CommandRunner } from 'nest-commander';
import {
  TypedCommandRunner,
  TypedOption,
} from '../data/utils/commands/commands.utils';

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
  optionSilent(): boolean {
    return;
  }
}
