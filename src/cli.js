import arg from "arg";
import inquirer from "inquirer";
import ora from "ora";
import { createProject } from "./main";

function parseArgumentsIntoOptions(rawArgs) {
  const config = { nosql: false, socket: { session: true } };

  const args = arg(
    {},
    {
      argv: rawArgs.slice(2)
    }
  );
  return {
    targetDirectory: args._[0]
  };
}

async function promptForMissingOptions(options) {
  const config = {};

  const questions = [];
  if (!options.targetDirectory) {
    questions.push({
      type: "input",
      name: "targetDirectory",
      default: "",
      message:
        "Please enter a folder name. Empty string will start project in current directory."
    });
  }

  questions.push({
    type: "list",
    name: "database",
    message: "Please choose which database provider you want",
    choices: ["MongoDB", "PostgresQL"],
    default: "MongoDB"
  });

  questions.push({
    type: "checkbox",
    name: "auth",
    message: "Which form of authentication do you want? Pick none for no auth.",
    choices: [
      { name: "google", value: "google" },
      { name: "local", value: "local" }
    ]
  });

  let answers = await inquirer.prompt(questions);
  const socketQuestion = [
    {
      type: "confirm",
      name: "socket",
      message: "Do you want socket.io?"
    }
  ];
  const socketSessionQuestion = [
    {
      type: "confirm",
      name: "socketsession",
      message:
        "Do you want access to express sessions in socket (ex: req.user)?"
    }
  ];
  if (answers.auth.length == 0) {
    answers = { ...answers, ...(await inquirer.prompt(socketQuestion)) };
  } else {
    answers.socket = true;
  }
  if (answers.auth.length != 0 || answers.socket) {
    answers = { ...answers, ...(await inquirer.prompt(socketSessionQuestion)) };
  }

  config.nosql = answers.database == "MongoDB";

  if (answers.auth.length == 0) {
    delete config.auth;
  } else {
    config.auth = {
      google: answers.auth.includes("google"),
      local: answers.auth.includes("local")
    };
  }

  if (answers.socket === false) {
    delete config.socket;
  } else {
    config.socket = { session: answers.socketsession == true };
  }

  if (answers.targetDirectory) {
    config.targetDirectory = answers.targetDirectory;
  }

  return { ...options, ...config };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  const spinner = ora({
    text: "Copying files over",
    interval: 100,
    spinner: "simpleDots"
  }).start();
  createProject(options).then(() => {
    spinner.succeed(
      "Done copying files over! Cd into the target directory and npm install :)"
    );
  });
}
