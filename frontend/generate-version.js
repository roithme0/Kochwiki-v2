const fs = require("fs");
const path = require("path");

const packageJsonPath = path.resolve(__dirname, "package.json");
const versionFilePath = path.resolve(__dirname, "src", "version.ts");

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

const versionFileContent = `// This file is auto-generated during the prebuild process.\n// The version number is extracted from package.json.\nexport const VERSION: string = '${version}';\n`;

fs.writeFileSync(versionFilePath, versionFileContent, "utf8");
console.log(`Version file created at ${versionFilePath}`);
