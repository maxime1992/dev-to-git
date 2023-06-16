import { Command, CommandRunner, Option } from 'nest-commander';

interface PublishCommandOptions {
  devToToken?: string;
  config?: string;
  repositoryUrl?: string;
  silent?: true;
}

@Command({
  name: 'publish',
  options: { isDefault: false },
})
export class PublishCommand extends CommandRunner {
  async run(inputs: string[], options: PublishCommandOptions): Promise<void> {
    return;
  }

  @Option({
    flags: '--config <path>',
    description: 'Pass custom path to .dev-to-git.json file',
    defaultValue: './dev-to-git.json',
  })
  optionConfig(val: string): string {
    return val;
  }

  @Option({
    flags: '--dev-to-token <token>',
    description: 'Token for publishing to dev.to',
  })
  optionDevToToken(val: string): string {
    return val;
  }

  @Option({
    flags: '--repository-url <url>',
    description: 'Url of your repository you keep your articles in',
  })
  optionRepositoryUrl(val: string): string {
    return val;
  }

  @Option({
    flags: '--silent',
    description: 'No console output',
  })
  optionSilent(): void {
    return;
  }
}
