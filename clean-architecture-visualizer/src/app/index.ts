#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { exec, spawn } from "child_process";

// Load package.json synchronously for compatibility with compiled output
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, "../../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const frontendPathFromSource = path.resolve(__dirname, "../../frontend");
const frontendPathFromDist = path.resolve(__dirname, "../../../frontend");
const FRONTEND_DIR = fs.existsSync(frontendPathFromSource)
  ? frontendPathFromSource
  : frontendPathFromDist;
const PAYLOAD_PATH = path.join(
  FRONTEND_DIR,
  "public",
  "cave-view-payload.json",
);
const VIEWER_PORT = 5173;
const API_PORT = 3131;
import { AppBuilder } from './appBuilder.js';
import { FileAccess } from '../data_access/fileAccess.js';
import { CleanArchAccess } from '../data_access/cleanArchInfoAccess.js';
import { SessionDBAccess } from "../data_access/sessionDBAccess.js";
import { GraphVerificationController } from '../interface_adapter/graphVerification/graphVerificationController.js';
import { GraphVerificationInteractor } from '../use_case/graphVerification/graphVerificationInteractor.js';
import { startServer } from "../server/server.js";

const program = new Command();

const app = new AppBuilder()
  .withFileAccess(new FileAccess())
  .withCleanArchAccess(new CleanArchAccess())
  .withSessionDBAccess(new SessionDBAccess())
  .buildGraphVerificationInteractor(GraphVerificationInteractor)
  .buildGraphVerificationController(GraphVerificationController)

program.version(packageJson.version);

program
  .command("view <filePath>")
  .description(
    "Read a file and open it in the React frontend (or print to console with --console)",
  )
  .option("--console", "Only print file contents to the terminal (no frontend)")
  .action((filePath: string, options: { console?: boolean }) => {
    try {
      const fullPath = path.resolve(filePath);
      const contents = fs.readFileSync(fullPath, "utf-8");

      if (options.console) {
        const consoleHighlighted = contents.replace(
          /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
          (_match: string, functionName: string) => {
            return chalk.cyan(functionName) + "(";
          },
        );
        console.log(consoleHighlighted);
        return;
      }

      // Write payload for React viewer
      const payload = {
        filePath: fullPath,
        content: contents,
        error: null as string | null,
      };
      // Create public directory if it doesn't exist
      fs.mkdirSync(path.dirname(PAYLOAD_PATH), { recursive: true });
      fs.writeFileSync(PAYLOAD_PATH, JSON.stringify(payload, null, 2));

      // Start React dev server (npm run dev in frontend)
      const isWindows = process.platform === "win32";
      const npmCmd = isWindows ? "npm.cmd" : "npm";
      const devProcess = spawn(npmCmd, ["run", "dev"], {
        cwd: FRONTEND_DIR,
        stdio: "inherit",
        shell: isWindows,
        windowsHide: true,
      });

      devProcess.on("error", (err) => {
        console.error(chalk.red("Failed to start frontend:"), err.message);
        process.exitCode = 1;
      });

      const openCommand =
        process.platform === "darwin"
          ? "open"
          : process.platform === "win32"
            ? "cmd /c start \"\""
            : "xdg-open";
      const viewerUrl = `http://localhost:${VIEWER_PORT}`;
      setTimeout(() => {
        exec(`${openCommand} "${viewerUrl}"`, (error) => {
          if (error) {
            console.warn(
              chalk.yellow("Could not open browser. Visit manually:"),
              viewerUrl,
            );
          } else {
            console.log(chalk.green("Frontend opened at"), viewerUrl);
          }
        });
      }, 2500);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error reading file: ${error.message}`);
      } else {
        console.error("An unknown error occurred");
      }
      process.exitCode = 1;
    }
  });

const DEFAULT_STRUCTURE = ["parent-folder", "child-folder"];

program
  .command("create-project <filePath>")
  .description(
    "Create a nested directory structure at the given path (parent-folder/child-folder)",
  )
  .action((filePath: string) => {
    try {
      const rootPath = path.resolve(filePath);
      const fullPath = path.join(rootPath, ...DEFAULT_STRUCTURE);
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(chalk.green("Created:"), fullPath);
      const parentPath = path.join(rootPath, DEFAULT_STRUCTURE[0]!);
      console.log(chalk.dim("  " + parentPath));
      console.log(chalk.dim("  " + fullPath));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red("Error creating project:"), error.message);
      } else {
        console.error("An unknown error occurred");
      }
      process.exitCode = 1;
    }
  });

program
  .command('start')
  .description('Start backend server and frontend dev server')
  .action(async () => {
    app.runGraphVerification();
    const backendServer = startServer();

    const isWindows = process.platform === "win32";
    const npmCmd = isWindows ? "npm.cmd" : "npm";

    const devProcess = spawn(npmCmd, ["run", "dev:backend"], {
      cwd: FRONTEND_DIR,
      stdio: "inherit",
      shell: isWindows,
      windowsHide: true,
    });

    let openTimer: NodeJS.Timeout;

    devProcess.on("error", (err) => {
      console.error(chalk.red("CRITICAL: Failed to start frontend:"), err.message);
      if (openTimer) clearTimeout(openTimer);
      shutdown("INTERNAL_ERROR"); 
    });

    const closeFrontend = () => {
      if (devProcess && !devProcess.killed) {
        devProcess.kill();
      }
    };

    let shutdownStarted = false;
    const shutdown = (signal: string) => {
      if (shutdownStarted) return;
      shutdownStarted = true;

      if (signal !== "INTERNAL_ERROR") {
        console.log(chalk.dim(`\nReceived ${signal}. Shutting down...`));
      }
      
      closeFrontend();

      const forceExitTimer = setTimeout(() => {
        process.exit(1);
      }, 3000);

      backendServer.close(() => {
        clearTimeout(forceExitTimer);
        process.exit(signal === "INTERNAL_ERROR" ? 1 : 0);
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));

    const openCommand =
      process.platform === "darwin"
        ? "open"
        : process.platform === "win32"
          ? "cmd /c start \"\""
          : "xdg-open";
    const appUrl = `http://localhost:${API_PORT}`;

    openTimer = setTimeout(() => {
      if (!shutdownStarted) { // Only open if we haven't crashed
        exec(`${openCommand} "${appUrl}"`, (error) => {
          if (error) {
            console.warn(chalk.yellow("Could not open browser. Visit manually:"), appUrl);
          } else {
            console.log(chalk.green("App opened at"), appUrl);
          }
        });
      }
    }, 2500);
  });

program
  .command('verify')
  .description('Verify whether the use cases found in child directories adhere to Clean Architeccture')
  .action(async() => {
    app.runGraphVerification();
  })

program.parse(process.argv);

program
  .command('end')
  .description('Close the express server and clean the tempdir')
  .action(async() => {
    
  })
