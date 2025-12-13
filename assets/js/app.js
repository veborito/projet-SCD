
// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//
// If you have dependencies that try to import CSS, esbuild will generate a separate `app.css` file.
// To load it, simply add a second `<link>` to your `root.html.heex` file.

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// // Establish Phoenix Socket and LiveView configuration.
import {Socket, Presence} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import {hooks as colocatedHooks} from "phoenix-colocated/scdapp"
import topbar from "../vendor/topbar"
import {loadColorPalette} from './home.js'
import * as party from "./party.js"


window.createParty = party.createParty
window.joinParty = party.joinParty
document.body.className = "bg-orange-50"

const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
const liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: {_csrf_token: csrfToken},
  hooks: {...colocatedHooks},
})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
window.addEventListener("phx:page-loading-stop", _info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket

// The lines below enable quality of life phoenix_live_reload
// development features:
//
//     1. stream server logs to the browser console
//     2. click on elements to jump to their definitions in your code editor
//
if (process.env.NODE_ENV === "development") {
  window.addEventListener("phx:live_reload:attached", ({detail: reloader}) => {
    // Enable server log streaming to client.
    // Disable with reloader.disableServerLogs()
    reloader.enableServerLogs()

    // Open configured PLUG_EDITOR at file:line of the clicked element's HEEx component
    //
    //   * click with "c" key pressed to open at caller location
    //   * click with "d" key pressed to open at function component definition location
    let keyDown
    window.addEventListener("keydown", e => keyDown = e.key)
    window.addEventListener("keyup", e => keyDown = null)
    window.addEventListener("click", e => {
      if(keyDown === "c"){
        e.preventDefault()
        e.stopImmediatePropagation()
        reloader.openEditorAtCaller(e.target)
      } else if(keyDown === "d"){
        e.preventDefault()
        e.stopImmediatePropagation()
        reloader.openEditorAtDef(e.target)
      }
    }, true)

    window.liveReloader = reloader
  })
}
// ---------------------------------------------------------------
// ------------------ DEBUT du code ------------------------------
// ---------------------------------------------------------------


let currentCol = "black"

export function changeColor(col) {
  currentCol = col
}

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");  
let drawing = false;
let localPoints = [];

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

window.addEventListener("resize", () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
})
canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => {
  drawing = false
  localPoints.push(null);
});

canvas.addEventListener("mousemove", event => {

  if (!drawing) {
    return;
  }
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  // console.log({x, y})
  localPoints.push({x, y});
  otherChannel.push("new_pos", {body: [localPoints, currentCol]})
  draw(localPoints, currentCol);
})

function draw(points, color) {
  if (points.length < 2 || points.at(-2) == null)
    return;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(points.at(-2).x, points.at(-2).y);
  ctx.lineTo(points.at(-1).x, points.at(-1).y);
  ctx.closePath();
  ctx.stroke()
}


loadColorPalette()

let socket = new Socket("/socket", {authToken: window.userToken})

socket.connect()

let channel = socket.channel("room:lobby", {
  name: window.location.search.split("=")[1],
})

let chatInput = document.querySelector("#chat-input")
let messagesContainer = document.querySelector("#messages")
chatInput.addEventListener("keypress", event => {
  if(event.key === 'Enter') {
    channel.push("new_msg", {body: [chatInput.value, window.location.search.split("=")[1]]})
    chatInput.value = ""
  }
})

channel.on("new_msg", payload => {
  let messageItem = document.createElement("p")
  let date = new Date()
  let seconds = String(date.getSeconds()).padStart(2, '0');
  let minutes = String(date.getMinutes()).padStart(2, '0');
  let hour = String(date.getHours()).padStart(2, '0');
  let time = `${hour}:${minutes}:${seconds}`

  messageItem.innerText = `[${time}] ${payload.body[1]}:  ${payload.body[0]}`
  messagesContainer.appendChild(messageItem)
})


let otherChannel = socket.channel("room:canvas", {})

let presence = new Presence(channel)


function renderOnlineUsers(presence) {
  let response = ""

  presence.list((id, {metas: [first, ...rest]}) => {
    let count = rest.length + 1
    response += `<br>${id}</br>`
  })

  document.querySelector("#team").innerHTML = response
}

presence.onSync(() => renderOnlineUsers(presence))

otherChannel.on("new_pos", payload => {
  let remotePoints = payload.body[0];
  let color = payload.body[1]
  draw(remotePoints, color)
})

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

otherChannel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })
