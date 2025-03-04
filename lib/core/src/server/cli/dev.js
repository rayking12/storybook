import program from 'commander';
import chalk from 'chalk';
import { logger } from '@storybook/node-logger';
import { parseList, getEnvConfig, checkDeprecatedFlags } from './utils';

async function getCLI(packageJson) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';

  program
    .version(packageJson.version)
    .option('-p, --port [number]', 'Port to run Storybook', (str) => parseInt(str, 10))
    .option('-h, --host [string]', 'Host to run Storybook')
    .option('-s, --static-dir <dir-names>', 'Directory where to load static files from', parseList)
    .option('-c, --config-dir [dir-name]', 'Directory where to load Storybook configurations from')
    .option(
      '--https',
      'Serve Storybook over HTTPS. Note: You must provide your own certificate information.'
    )
    .option(
      '--ssl-ca <ca>',
      'Provide an SSL certificate authority. (Optional with --https, required if using a self-signed certificate)',
      parseList
    )
    .option('--ssl-cert <cert>', 'Provide an SSL certificate. (Required with --https)')
    .option('--ssl-key <key>', 'Provide an SSL key. (Required with --https)')
    .option('--smoke-test', 'Exit after successful start')
    .option('--ci', "CI mode (skip interactive prompts, don't open browser)")
    .option('--loglevel [level]', 'Control level of logging during build')
    .option('--quiet', 'Suppress verbose build output')
    .option('--no-version-updates', 'Suppress update check', true)
    .option(
      '--no-release-notes',
      'Suppress automatic redirects to the release notes after upgrading',
      true
    )
    .option('--no-manager-cache', 'Do not cache the manager UI')
    .option('--no-dll', 'Do not use dll references (no-op)')
    .option('--docs-dll', 'Use Docs dll reference (legacy)')
    .option('--ui-dll', 'Use UI dll reference (legacy)')
    .option('--debug-webpack', 'Display final webpack configurations for debugging purposes')
    .option(
      '--preview-url [string]',
      'Disables the default storybook preview and lets your use your own'
    )
    .option('--docs', 'Build a documentation-only site using addon-docs')
    .parse(process.argv);

  logger.setLevel(program.loglevel);

  // Workaround the `-h` shorthand conflict.
  // Output the help if `-h` is called without any value.
  // See storybookjs/storybook#5360
  program.on('option:host', (value) => {
    if (!value) {
      program.help();
    }
  });

  logger.info(chalk.bold(`${packageJson.name} v${packageJson.version}`) + chalk.reset('\n'));

  // The key is the field created in `program` variable for
  // each command line argument. Value is the env variable.
  getEnvConfig(program, {
    port: 'SBCONFIG_PORT',
    host: 'SBCONFIG_HOSTNAME',
    staticDir: 'SBCONFIG_STATIC_DIR',
    configDir: 'SBCONFIG_CONFIG_DIR',
    ci: 'CI',
  });

  if (typeof program.port === 'string' && program.port.length > 0) {
    program.port = parseInt(program.port, 10);
  }

  checkDeprecatedFlags(program);
  return { ...program };
}

export default getCLI;
