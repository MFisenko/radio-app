const { withPodfile } = require('@expo/config-plugins');

module.exports = function withIosNonModularHeaders(config) {
  return withPodfile(config, (config) => {
    let podfileContents = config.modResults.contents;

    if (!podfileContents.includes('$RNFirebaseAsStaticFramework = true')) {
      const prepareProjectLine = 'prepare_react_native_project!';

      if (!podfileContents.includes(prepareProjectLine)) {
        throw new Error('Unable to find prepare_react_native_project! in Podfile.');
      }

      podfileContents = podfileContents.replace(
        prepareProjectLine,
        `${prepareProjectLine}\n\n$RNFirebaseAsStaticFramework = true`
      );
    }

    if (podfileContents.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
      config.modResults.contents = podfileContents;
      return config;
    }

    const postInstallBlock = `  post_install do |installer|\n    react_native_post_install(\n      installer,\n      config[:reactNativePath],\n      :mac_catalyst_enabled => false,\n      :ccache_enabled => ccache_enabled?(podfile_properties),\n    )\n  end`;

    const patchedPostInstallBlock = `  post_install do |installer|\n    react_native_post_install(\n      installer,\n      config[:reactNativePath],\n      :mac_catalyst_enabled => false,\n      :ccache_enabled => ccache_enabled?(podfile_properties),\n    )\n\n    installer.pods_project.targets.each do |target|\n      target.build_configurations.each do |build_configuration|\n        build_configuration.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'\n      end\n    end\n  end`;

    if (!podfileContents.includes(postInstallBlock)) {
      throw new Error('Unable to patch Podfile post_install block for non-modular header support.');
    }

    config.modResults.contents = podfileContents.replace(postInstallBlock, patchedPostInstallBlock);

    return config;
  });
};