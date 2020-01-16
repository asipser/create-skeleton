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

function parse_file(filepath, mustacheConfig) {
  const file = fs.readFileSync(filepath);
  const relativePath = path.relative(TEMPLATE_PATH, filepath);
  const outputPath = path.join(".", relativePath);
  const updatedFile = mustache.render(file.toString(), mustacheConfig);
  fs.writeFileSync(outputPath, updatedFile);
}

function parse_directory(dirpath, mustacheConfig) {
  // list all files at path
  files = fs.readdirSync(dirpath);
  files.forEach(f => {
    if (!EXCLUDED_FILES.has(f)) {
      const p = path.resolve(dirpath, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        const relativePath = path.relative(TEMPLATE_PATH, p);
        const outputPath = path.join(".", relativePath);
        fs.mkdirSync(outputPath, { recursive: true });
        parse_directory(p, mustacheConfig);
      } else {
        parse_file(p, mustacheConfig);
      }
    }
  });
}

function main() {
  const apiPath = path.join(TEMPLATE_PATH, "server", "auth.js");
  const config = { nosql: true };

  parse_directory(TEMPLATE_PATH, config);
}

main();
