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
const FRONTEND_DIR = path.resolve(__dirname, "../../frontend");
const PAYLOAD_PATH = path.join(
  FRONTEND_DIR,
  "public",
  "cave-view-payload.json",
);
const VIEWER_PORT = 5173;

const program = new Command();

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

program.parse(process.argv);
