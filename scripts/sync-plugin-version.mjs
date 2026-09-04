#!/usr/bin/env node
// Copies package.json's version into .claude-plugin/plugin.json.
// Runs as part of `npm run version`, immediately after `changeset version`.
// With --check it changes nothing and exits 1 if the two versions differ.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginPath = join(repo, ".claude-plugin", "plugin.json");

function parseJson(text, filePath) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`Could not parse JSON in ${filePath}: ${reason}`);
    process.exit(1);
  }
}

const packagePath = join(repo, "package.json");
const { version } = parseJson(readFileSync(packagePath, "utf8"), packagePath);
const source = readFileSync(pluginPath, "utf8");
const plugin = parseJson(source, pluginPath);

if (plugin.version === version) {
  console.log(`plugin.json version is ${version} (already in sync)`);
  process.exit(0);
}

if (process.argv.includes("--check")) {
  console.error(
    `plugin.json version is ${plugin.version}, package.json is ${version}. Run \`node scripts/sync-plugin-version.mjs\`.`,
  );
  process.exit(1);
}

// Rewrite only the version line, to keep the key order and the formatting.
const updated = source.replace(
  /("version"\s*:\s*")[^"]*(")/,
  `$1${version}$2`,
);

if (parseJson(updated, pluginPath).version !== version) {
  console.error(`Could not find a version field to replace in ${pluginPath}.`);
  process.exit(1);
}

writeFileSync(pluginPath, updated);
console.log(`plugin.json version ${plugin.version} -> ${version}`);
