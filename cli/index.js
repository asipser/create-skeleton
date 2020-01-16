path = require("path");
mustache = require("mustache");
fs = require("fs");

function writeFileSyncRecursive(filename, content, charset) {
  // create folder path if not exists
  filename
    .split("/")
    .slice(0, -1)
    .reduce((last, folder) => {
      let folderPath = last ? last + "/" + folder : folder;
      console.log(folderPath);
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
      return folderPath;
    });

  fs.writeFileSync(filename, content, charset);
}

function main() {
  const templatePath = path.resolve(__dirname, "..", "template");

  const apiPath = path.join(templatePath, "server", "auth.js");
  const config = { nosql: true };

  // const apiPath = path;
  files = fs.readdirSync(templatePath);
  files.forEach(f => {
    console.log(f);
  });
  const file = fs.readFileSync(apiPath);
  const outputPath = path.resolve(".");
  const outputApiPath = path.join(outputPath, "server", "api.js");

  const updatedFile = mustache.render(file.toString(), config);
  writeFileSyncRecursive(outputApiPath, updatedFile);
}

main();
