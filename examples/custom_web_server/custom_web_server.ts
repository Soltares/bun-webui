// To run this script:
// python simple_web_server.py
// bun run custom_web_server.ts

// To import from local (Debugging and Development)
// import { WebUI } from "../../mod.ts";

// To import from NPM (Production)
import { WebUI } from '@webui-dev/bun-webui';

async function allEvents(e: WebUI.Event) {
  /*
    e.window: WebUI;
    e.eventType: WebUI.EventType;
    e.element: string;
  */
  console.log(`\nallEvents: window = '${e.window}'`);
  console.log(`allEvents: eventType = '${e.eventType}'`);
  console.log(`allEvents: element = '${e.element}'`);
  switch (e.eventType) {
    case WebUI.EventType.Disconnected:
      // Window disconnection event
      console.log(`Window closed.`);
      break;
    case WebUI.EventType.Connected:
      // Window connection event
      console.log(`Window connected.`);
      break;
    case WebUI.EventType.MouseClick:
      // Mouse click event
      console.log(`Mouse click.`);
      break;
    case WebUI.EventType.Navigation:
      // Window navigation event
      const url = e.arg.string(0);
      console.log(`Navigation to '${url}'`);
      // Because we used `webui_bind(MyWindow, "", events);`
      // WebUI will block all `href` link clicks and sent here instead.
      // We can then control the behaviour of links as needed.
      e.window.navigate(url);
      break;
    case WebUI.EventType.Callback:
      // Function call event
      console.log(`Function call.`);
      break;
  }
}

async function myBackendFunc(e: WebUI.Event) {
  const a = e.arg.number(0); // First argument
  const b = e.arg.string(1); // Second argument
  const c = e.arg.boolean(2); // Third argument
  console.log(`\nFirst argument: ${a}`);
  console.log(`Second argument: ${b}`);
  console.log(`Third argument: ${c}`);
}

// Create new window
const myWindow = new WebUI();

// Bind All Events
myWindow.bind("", allEvents);

// Bind Backend Function
myWindow.bind("myBackendFunc", myBackendFunc);

// Bind Exit Function
myWindow.bind("exit", () => {
  // Close all windows and exit
  WebUI.exit();
});

// Set the web-server/WebSocket port that WebUI should
// use. This means `webui.js` will be available at:
// http://localhost:MY_PORT_NUMBER/webui.js
myWindow.setPort(8081);

// Show a new window and point to our custom web server
// Assuming the custom web server is running on port
// 8080...
myWindow.show("http://localhost:8080/");

// Wait until all windows get closed
await WebUI.wait();

console.log("Thank you.");

process.exit(0);
