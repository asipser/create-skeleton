import arg from "arg";
import inquirer from "inquirer";
import path from "path";
import { createProject } from "./main";
import chalk from "chalk";
import fs from "fs";

// Constants: user selection choices for CLI
const MONGODB = "MongoDB";
const POSTGRES = "PostgresQL";
const NO_AUTH = "No Authentication";
const ONLY_GOOGLE = "Only Google OAuth";
const ONLY_LOCAL = "Only Local Auth";
const LOCAL_AND_GOOGLE = "Both Local & Google Auth";

function parseArgumentsIntoOptions(rawArgs) {
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
  questions.push({
    type: "input",
    name: "title",
    message:
      "What is the name of your application? This will show up in the website title.",
    default: "CHANGE ME"
  });
  questions.push({
    type: "list",
    name: "database",
    message: "Please choose which database provider you want",
    choices: [MONGODB, POSTGRES],
    default: MONGODB
  });

  questions.push({
    type: "list",
    name: "auth",
    message: "Please choose what form of authentication you want",
    choices: [NO_AUTH, ONLY_GOOGLE, ONLY_LOCAL, LOCAL_AND_GOOGLE]
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

  //if no auth, check if they want socket.
  if (answers.auth == NO_AUTH) {
    answers = { ...answers, ...(await inquirer.prompt(socketQuestion)) };
  }
  // check if users want socket sessions
  if (answers.auth != NO_AUTH || answers.socket) {
    answers = { ...answers, ...(await inquirer.prompt(socketSessionQuestion)) };
  }

  //update user configuration based off questions answered
  config.title = answers.title;
  config.nosql = answers.database == MONGODB;

  if (answers.auth == NO_AUTH) {
    delete config.auth;
  } else {
    config.auth = {
      google: answers.auth == ONLY_GOOGLE || answers.auth == LOCAL_AND_GOOGLE,
      local: answers.auth == ONLY_LOCAL || answers.auth == LOCAL_AND_GOOGLE
    };
  }

  if (answers.socket === false) {
    delete config.socket;
  } else {
    config.socket = { session: answers.socketsession == true };
  }

  return { ...options, ...config };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  if (!options.targetDirectory) {
    console.log("Please specify the project directory:");
    console.log(
      "  " +
        chalk.blue("create-react-skeleton ") +
        chalk.green("<project-directory>")
    );
  } else if (fs.existsSync(options.targetDirectory)) {
    console.log(
      chalk.redBright("Error: ") + "Project directory must not already exist"
    );
  } else {
    options = await promptForMissingOptions(options);
    fs.mkdirSync(path.join(".", options.targetDirectory));
    await createProject(options);
  }
}
