const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'node_modules/@react-native-firebase/analytics/ios/RNFBAnalytics/RNFBAnalyticsModule.h',
  'node_modules/@react-native-firebase/crashlytics/ios/RNFBCrashlytics/RNFBCrashlyticsModule.h',
  'node_modules/@react-native-firebase/remote-config/ios/RNFBConfig/RNFBConfigModule.h',
];

const originalImportBlock = [
  '#import <Foundation/Foundation.h>',
  '',
  '#import <React/RCTBridgeModule.h>',
].join('\n');

const patchedImportBlock = [
  '#import <Foundation/Foundation.h>',
  '',
  '#if __has_include(<RNFBApp/RNFBAppModule.h>)',
  '#import <RNFBApp/RNFBAppModule.h>',
  '#endif',
  '#import <React/RCTBridgeModule.h>',
].join('\n');

let patchedFiles = 0;

for (const relativeFilePath of filesToPatch) {
  const absoluteFilePath = path.join(process.cwd(), relativeFilePath);

  if (!fs.existsSync(absoluteFilePath)) {
    continue;
  }

  const fileContents = fs.readFileSync(absoluteFilePath, 'utf8');

  if (fileContents.includes(patchedImportBlock)) {
    continue;
  }

  if (!fileContents.includes(originalImportBlock)) {
    throw new Error(`Unable to patch RNFirebase header: ${relativeFilePath}`);
  }

  fs.writeFileSync(
    absoluteFilePath,
    fileContents.replace(originalImportBlock, patchedImportBlock),
    'utf8'
  );

  patchedFiles += 1;
}

console.log(`Patched ${patchedFiles} RNFirebase iOS header file(s).`);