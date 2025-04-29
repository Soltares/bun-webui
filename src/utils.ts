// Bun WebUI
// Utilities

import { promises as fs } from "fs";
import { join, dirname } from "path";

export let isDev = process.argv0 == "bun"

/** Absolute path to executable file */
export let executableFile = isDev
  ? Bun.main
  : Bun.which(process.argv0) ?? process.argv0

/** Absolute path to executable directory */
export let executableDir = isDev
  ? import.meta.dir
  : dirname(executableFile)

/** Normalized resource path for Dev and Prod */
export let resourceDir = isDev
  ? join(executableDir, "..", "dist")
  : executableDir

// The WebUI core version to download
const WebUICoreVersion = "2.5.0-beta.3";

/**
 * Download a file from the Internet and save it to the destination.
 */
async function downloadFile(url: string, dest: string) {
  const res = await fetch(url);
  const fileData = new Uint8Array(await res.arrayBuffer());
  await fs.writeFile(dest, fileData);
}

/**
 * Run a system command.
 */
async function runCommand(cmd: string, args: string[]): Promise<void> {
  const process = Bun.spawn({
    cmd: [cmd, ...args],
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await process.exited;
  if (exitCode !== 0) {
    throw new Error(`Command "${cmd}" failed with exit code ${exitCode}`);
  }
}

/**
 * Create a directory. Uses recursive mkdir.
 */
async function createDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Copy a file from srcPath to destPath, overwriting if necessary.
 */
async function copyFileOverwrite(srcPath: string, destPath: string) {
  try {
    await fs.rm(destPath);
  } catch (error) {
    if ((error as any).code !== "ENOENT") {
      throw error;
    }
  }
  await fs.copyFile(srcPath, destPath);
}

/**
 * Check if a file exists.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if ((error as any).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/**
 * Download the core WebUI library.
 */
export async function downloadCoreLibrary() {
  // Base URL
  // const baseUrl = `https://github.com/webui-dev/webui/releases/download/${WebUICoreVersion}/`;
  const baseUrl = `https://github.com/webui-dev/webui/releases/download/nightly/`;
  // Detect OS
  let os: string, cc: string, ext: string;
  if (process.platform === "darwin") {
    os = "macos";
    cc = "clang";
    ext = "dylib";
  } else if (process.platform === "win32") {
    os = "windows";
    cc = "msvc";
    ext = "dll";
  } else {
    os = "linux";
    cc = "gcc";
    ext = "so";
  }
  // Detect Architecture
  const archMap: Record<string, string> = {
    "x86": "x86",
    "x64": "x64",
    "arm": "arm",
    "arm64": "arm64",
  };
  const arch = archMap[process.arch];
  if (!arch) {
    console.error(`Error: Unsupported architecture '${process.arch}'`);
    return;
  }

  // Construct file name and download URL
  const cacheDir = join(resourceDir, "cache");
  const fileName = `webui-${os}-${cc}-${arch}`;
  const fileUrl = `${baseUrl}${fileName}.zip`;
  const outputDir = join(resourceDir, fileName);

  // Create cache directory
  await createDirectory(cacheDir);

  // Download the archive
  const zipPath = join(cacheDir, `${fileName}.zip`);
  await downloadFile(fileUrl, zipPath);

  // Extract the archive
  if (process.platform === "win32") {
    await runCommand("tar", ["-xf", zipPath, "-C", cacheDir]);
  } else {
    await runCommand("unzip", ["-o", "-q", zipPath, "-d", cacheDir]);
  }

  // Copy library
  const libFile = process.platform === "win32" ? `webui-2.${ext}` : `libwebui-2.${ext}`;
  await createDirectory(outputDir);
  await copyFileOverwrite(join(cacheDir, fileName, libFile), join(outputDir, libFile));

  // Remove cache directory
  await fs.rm(cacheDir, { recursive: true, force: true });
}

/**
 * Convert a string to a C-style string (null-terminated).
 */
export function toCString(value: string): Uint8Array {
  return new TextEncoder().encode(value + "\0");
}

/**
 * Convert a C-style string (Uint8Array) to a JavaScript string.
 */
export function fromCString(value: Uint8Array): string {
  const end = value.findIndex((byte) => byte === 0x00);
  return new TextDecoder().decode(value.slice(0, end));
}

export class WebUIError extends Error {}
