path = require("path");
mustache = require("mustache");
fs = require("fs");

const EXCLUDED_FILES = new Set([
  "README.md",
  ".git",
  "node_modules",
  ".gitkeep"
]);

const TEMPLATE_PATH = path.resolve(__dirname, "..", "template");

function convert_template_path_to_output_path(filepath) {
  const relativePath = path.relative(TEMPLATE_PATH, filepath);
  return path.join(".", relativePath);
}

function parse_file(filepath, mustacheConfig) {
  const file = fs.readFileSync(filepath);
  const updatedFile = mustache.render(file.toString(), mustacheConfig);
  fs.writeFileSync(convert_template_path_to_output_path(filepath), updatedFile);
}

function parse_directory(dirpath, mustacheConfig) {
  // list all files at path
  files = fs.readdirSync(dirpath);
  files.forEach(f => {
    if (!EXCLUDED_FILES.has(f)) {
      const p = path.resolve(dirpath, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        fs.mkdirSync(convert_template_path_to_output_path(p), {
          recursive: true
        });
        parse_directory(p, mustacheConfig);
      } else {
        parse_file(p, mustacheConfig);
      }
    }
  });
}

function main() {
  const apiPath = path.join(TEMPLATE_PATH, "server", "auth.js");
  const config = { nosql: false };

  parse_directory(TEMPLATE_PATH, config);
}

main();
