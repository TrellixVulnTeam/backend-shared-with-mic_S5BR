import path from 'path';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { bootstrap, defaultConfig, mergeConfig } from '@vendure/core';
import { clearAllTables, populateCustomers } from '@vendure/testing';
import { config } from './src/vendure-config';
import { populate } from '@vendure/core/cli';
/* eslint-disable @typescript-eslint/no-var-requires */
const initialData = require('@vendure/create/assets/initial-data.json');

// tslint:disable:no-console

/**
 * A CLI script which populates the database with some sample data
 */
if (require.main === module) {
  // Running from command line
  console.log('start populating');
  const populateConfig = mergeConfig(
    defaultConfig,
    mergeConfig(config, {
      authOptions: {
        tokenMethod: 'bearer',
        requireVerification: false,
      },
      importExportOptions: {
        importAssetsDir: resolveFromCreatePackage('assets/images'),
      },
      customFields: {},
      plugins: config.plugins?.filter(plugin => plugin !== AdminUiPlugin),
    })
  );
  clearAllTables(populateConfig, true)
    .then(() =>
      populate(
        () => bootstrap(populateConfig),
        initialData,
        resolveFromCreatePackage('assets/products.csv')
      )
    )
    .then(async app => {
      console.log('populating customers...');
      await populateCustomers(app, 10, console.log);
      //return app.close();
    })
    .then(
      () => process.exit(0),
      err => {
        console.log(err);
        process.exit(1);
      }
    );
}

function resolveFromCreatePackage(target: string): string {
  return path.join(path.dirname(require.resolve('@vendure/create')), target);
}
