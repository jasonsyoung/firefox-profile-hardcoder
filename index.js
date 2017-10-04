#!/usr/bin/env node
"use strict";
const fs = require("fs");

const ArgumentParser = require("argparse").ArgumentParser;
const parser = new ArgumentParser({
  version: '0.0.4',
  addHelp: true,
  description: 'Updates a Firefox.app to load a specific profile'
});
parser.addArgument(["-a", "--app"], {
  required: true,
  help: "The Firefox application to update"
});
parser.addArgument(["-p", "--profile"], {
  required: true,
  help: "The Firefox profile to use",
  dest: 'profile'
});
parser.addArgument(["-n", "--no-backup"], {
  defaultValue: true,
  action: "storeFalse",
  required: false,
  dest: "backup",
  help: `Don't first backup application`
});

const options = parser.parseArgs();

if (!fs.existsSync(options.app)) {
  let error = new Error(`${options.app} does not exist!`);
  console.error(error);
  throw error;
}

if (options.backup) {
  options.appBackup = options.app + `.ff-hc-backup`;
  const ncp = require("ncp").ncp;
  ncp.limit = 16;
  if (fs.existsSync(options.appBackup)) {
    require('child_process').execSync(`/bin/rm -rf "${options.appBackup}"`);
  }
  ncp(options.app, options.appBackup, err => {
    if (err) {
      console.error('Failed creating backup, not continuing', err);
      throw err;
      process.exit(1);
    }
  });
}

const path = require('path');
const plist = require('plist');
const infoPlistPath = path.join(options.app, 'Contents', 'Info.plist');
if (!fs.existsSync(infoPlistPath)) {
    let error = new Error('Are you sure this is an application bundle? Info.plist was not found.');
    console.error(error);
    throw error;
    process.exit(2);
}
const EXEC_ATTR = 'CFBundleExecutable';
const EXEC_FILE = 'launcher';
const data = fs.readFileSync(infoPlistPath, 'utf8');
const infoPlist = plist.parse(data);
infoPlist[EXEC_ATTR] = EXEC_FILE;
fs.writeFileSync(infoPlistPath, plist.build(infoPlist));

const launcherPath = path.join(options.app, 'Contents', 'MacOS', EXEC_FILE);
const launcherData = `#!/bin/sh
cd /Applications/Firefox.app/Contents/MacOS
./firefox-bin -no-remote -P ${options.profile} "$@"`;
fs.writeFile(launcherPath, launcherData, err => {
    if (!err) {
        fs.chmod(launcherPath, '755', error => {
            if (!error) {
                console.log(`Successfully modified ${options.app}`);
                process.exit(0);
            } else {
                console.error(`Failed settings permissions on ${launcherPath}`, error);
                process.exit(4);
            }
        });
    } else {
        console.error(`Failed writing launcher script ${launcherPath}`, err);
        process.exit(3);
    }
});
