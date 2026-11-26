const { withGradleProperties } = require('@expo/config-plugins');

function setProperty(properties, key, value) {
  const existing = properties.find((entry) => entry.type === 'property' && entry.key === key);

  if (existing) {
    existing.value = value;
    return;
  }

  properties.push({ type: 'property', key, value });
}

module.exports = function withAndroidBuildConfig(config) {
  return withGradleProperties(config, (config) => {
    const properties = config.modResults;

    setProperty(properties, 'org.gradle.parallel', 'true');
    setProperty(properties, 'org.gradle.caching', 'true');
    setProperty(properties, 'reactNativeArchitectures', 'arm64-v8a');

    return config;
  });
};
