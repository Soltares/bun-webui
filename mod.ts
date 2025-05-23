/**
 * # Bun WebUI
 *
 * > Use any web browser as GUI, with Bun in the backend and HTML5 in the
 * > frontend, all in a lightweight Bun module.
 *
 * ## Features
 *
 * - Fully Independent (_No need for any third-party runtimes_)
 * - Lightweight _~900 Kb_ for the whole package & Small memory footprint
 * - Fast binary communication protocol between WebUI and the browser (_Instead of JSON_)
 * - Multi-platform & Multi-Browser
 * - Using private profile for safety
 * - Original library written in Pure C
 *
 * ## Minimal Example
 *
 * ```ts
 * import { WebUI } from '@webui-dev/bun-webui';
 *
 * const myWindow = new WebUI();
 * myWindow.show("<html><script src=\"webui.js\"></script> Hello World! </html>");
 * await WebUI.wait();
 * ```
 *
 * @module
 * @license MIT
 */
export { WebUI } from "./src/webui.ts";
