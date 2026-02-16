function getEnv(key, options = {}) {
  const { required = false, defaultValue = undefined } = options;

  const value = process.env[key];

  if ((value === undefined || value === "") && required) {
    throw new Error(`Environment variable "${key}" is required`);
  }

  return value ?? defaultValue;
}

export default getEnv;
