const { withXcodeProject, withPodfile } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

module.exports = function withGoogleServiceConfig(config) {
  // Copy GoogleService-Info.plist and add to Xcode project
  config = withXcodeProject(config, async (config) => {
    const sourceFile = path.join(config.modRequest.projectRoot, 'GoogleService-Info.plist');
    const destFile = path.join(config.modRequest.projectRoot, 'ios/radioapp/GoogleService-Info.plist');
    
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, destFile);
      console.log('✅ Copied GoogleService-Info.plist to ios/radioapp/');
      
      // Add file to Xcode project
      const project = config.modResults;
      const pbxProject = project.pbxProject();
      const fileRef = pbxProject.addFile('GoogleService-Info.plist', 'radioapp');
      
      if (fileRef) {
        pbxProject.addBuildPhase(
          [fileRef],
          'PBXResourcesBuildPhase',
          'Resources',
          project.findPBXGroupKey({ name: 'radioapp' })
        );
        console.log('✅ Added GoogleService-Info.plist to Xcode build phases');
      }
    }
    
    return config;
  });

  // Add use_modular_headers! to Podfile
  config = withPodfile(config, async (config) => {
    const podfileContent = config.modResults.contents;
    
    // Check if use_modular_headers! is already present
    if (!podfileContent.includes('use_modular_headers!')) {
      // Add it after use_expo_modules!
      const updatedContent = podfileContent.replace(
        "use_expo_modules!",
        "use_expo_modules!\n  use_modular_headers!"
      );
      config.modResults.contents = updatedContent;
      console.log('✅ Added use_modular_headers! to Podfile');
    }
    
    return config;
  });

  return config;
};


