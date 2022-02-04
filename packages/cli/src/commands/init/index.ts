import Command, {Flags} from '../../core/Command';
import degit from 'degit';
// import {dirname} from 'path';

export enum Template {
  Minimal = 'Hydrogen Minimal starter',
  Default = 'Default Hydrogen demo',
}

const TEMPLATE_MAP: Record<Template, string> = {
  [Template.Default]: 'Shopify/hydrogen/examples/template-hydrogen-default',
  [Template.Minimal]: 'Shopify/hydrogen/examples/template-hydrogen-minimal',
};

const RENAME_MAP = {
  _gitignore: '.gitignore',
};

export class Init extends Command {
  static args = [{name: 'name', description: 'Root of the project'}];
  static flags = {
    root: Flags.string({
      char: 'r',
      description: 'Root directory of the project.',
    }),
    local: Flags.boolean({
      char: 'l',
      description: 'Use local hydrogen',
    }),
  };
  async run() {
    const {args, flags} = await this.parse(Init);

    const name =
      args.name ??
      (await this.interface.ask('What do you want to name this app?', {
        validate: validateProjectName,
        default: 'snow-devil',
        name: 'name',
      }));

    const root =
      flags.root ??
      (await this.interface.ask('Where do you want to generate this app?', {
        default: `./${name}`,
        name: 'root',
      }));

    this.name = name;
    this.root = root || name;

    if (await this.fs.hasDirectory(this.root)) {
      const overwrite = await this.interface.ask(
        `${this.root} is not an empty directory. Do you want to remove the existing files and continue?`,
        {boolean: true, name: 'overwrite', default: false}
      );

      if (overwrite) {
        await this.fs.remove(this.root);
      }
    } else {
      await this.fs.makeDirectory(this.root);
    }

    const template = await this.interface.ask<Template>(
      'Would you like to start from a template?',
      {
        choices: [Template.Default, Template.Minimal],
        name: 'template',
      }
    );

    const templateSource: string = TEMPLATE_MAP[template];

    const emitter = degit(templateSource, {
      cache: true,
      force: true,
      verbose: true,
    });

    emitter.on('info', (info) => {
      console.log('hey');
      console.log(info);
    });

    await emitter.clone(`${this.root}/tmp`);

    this.interface.say('done');
    const rootTmp = `${this.root}/tmp`;
    const files = await this.fs.glob(`${rootTmp}/**/*`, {
      dot: true,
      nodir: true,
    });

    for (const sourceFile of files) {
      const fileName = this.fs.relativePath(sourceFile, rootTmp);
      const finalFilename =
        RENAME_MAP[fileName as keyof typeof RENAME_MAP] ?? fileName;
      const destPath = sourceFile
        .replace(rootTmp, this.root)
        .replace(fileName, finalFilename);

      const overwritten = await this.fs.hasFile(destPath);
      await this.fs.copy(sourceFile, destPath);

      this.interface.printFile({
        path: this.fs.relativePath(destPath, process.cwd()),
        overwritten,
      });
    }
  }
}

function validateProjectName(name: string) {
  const packageNameRegExp =
    /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

  if (packageNameRegExp.test(name)) {
    return true;
  }

  const suggested = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-');

  return `Invalid package.json name. Try ${suggested} instead.`;
}
