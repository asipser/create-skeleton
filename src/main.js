import path from "path";
import mustache from "mustache";
import fs from "fs";

const EXCLUDED_FILES = new Set([
  "README.md",
  ".git",
  "node_modules",
  ".gitkeep"
]);

const TEMPLATE_PATH = path.resolve(__dirname, "..", "template");

function convert_template_path_to_output_path(targetDirectory, filepath) {
  console.log(filepath);
  const relativePath = path.relative(TEMPLATE_PATH, filepath);
  return path.join(targetDirectory, relativePath);
}

function parse_file(filepath, mustacheConfig) {
  const file = fs.readFileSync(filepath);
  const updatedFile = mustache.render(file.toString(), mustacheConfig);
  if (updatedFile != "") {
    fs.writeFileSync(
      convert_template_path_to_output_path(
        mustacheConfig.targetDirectory,
        filepath
      ),
      updatedFile
    );
  }
}

function parse_directory(dirpath, mustacheConfig) {
  // list all files at path
  const files = fs.readdirSync(dirpath);
  files.forEach(f => {
    if (!EXCLUDED_FILES.has(f)) {
      const p = path.resolve(dirpath, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        fs.mkdirSync(
          convert_template_path_to_output_path(
            mustacheConfig.targetDirectory,
            p
          ),
          {
            recursive: true
          }
        );
        parse_directory(p, mustacheConfig);
      } else {
        parse_file(p, mustacheConfig);
      }
    }
  });
}

export async function createProject(options) {
  console.log(options);

  //check that targetDirectory does NOT exist or is EMPTY
  fs.mkdirSync(path.join(".", options.targetDirectory));

  parse_directory(TEMPLATE_PATH, options);
}
