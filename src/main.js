import path from "path";
import mustache from "mustache";
import fs from "fs";
import chalk from "chalk";

import Listr from "listr";
import { projectInstall } from "pkg-install";

const { promisify } = require("util");

const readFileAsync = promisify(fs.readFile);
const readDirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);
const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);

const EXCLUDED_FILES = new Set([
  "README.md",
  ".git",
  "node_modules",
  ".gitkeep"
]);

const TEMPLATE_PATH = path.resolve(__dirname, "..", "template");

function convert_template_path_to_output_path(targetDirectory, filepath) {
  const relativePath = path.relative(TEMPLATE_PATH, filepath);
  return path.join(targetDirectory, relativePath);
}

async function parse_file(filepath, mustacheConfig) {
  const file = await readFileAsync(filepath);
  const updatedFile = mustache.render(file.toString(), mustacheConfig);
  if (updatedFile != "") {
    return writeFileAsync(
      convert_template_path_to_output_path(
        mustacheConfig.targetDirectory,
        filepath
      ),
      updatedFile
    );
  }
}

async function parse_directory(dirpath, mustacheConfig) {
  // list all files at path
  const files = await readDirAsync(dirpath);
  return Promise.all(
    files.map(async f => {
      if (!EXCLUDED_FILES.has(f)) {
        const p = path.resolve(dirpath, f);
        const stat = await statAsync(p);
        if (stat.isDirectory()) {
          await mkdirAsync(
            convert_template_path_to_output_path(
              mustacheConfig.targetDirectory,
              p
            ),
            {
              recursive: true
            }
          );
          return parse_directory(p, mustacheConfig);
        } else {
          return parse_file(p, mustacheConfig);
        }
      }
    })
  );
}

async function copyTemplateFiles(options) {
  return parse_directory(TEMPLATE_PATH, options);
}

export async function createProject(options) {
  const tasks = new Listr([
    {
      title: "Copy project files",
      task: () => copyTemplateFiles(options)
    },
    {
      title: "Install dependencies",
      task: () =>
        projectInstall({
          cwd: `${options.targetDirectory}`
        })
    }
  ]);

  await tasks.run();
  console.log("%s Project ready", chalk.greenBright("DONE"));
  return true;
}
