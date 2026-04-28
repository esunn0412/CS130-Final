// Metro otherwise resolves `firebase/auth` to the browser build of `@firebase/auth`,
// which does not export `getReactNativePersistence` (it lives in `dist/rn` only).
// @see https://github.com/firebase/firebase-js-sdk/issues/9316
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);
const authRnPath = path.join(
  projectRoot,
  "node_modules",
  "@firebase",
  "auth",
  "dist",
  "rn",
  "index.js"
);

const resolveRequest = config.resolver?.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "firebase/auth" && platform !== "web") {
    return { type: "sourceFile", filePath: authRnPath };
  }
  if (typeof resolveRequest === "function") {
    return resolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
