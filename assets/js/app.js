// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
//import "./user_socket.js"

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
// Establish Phoenix Socket and LiveView configuration.
import {Socket} from "phoenix"
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

let currentCol = "black"

export function changeColor(col) {
  currentCol = col
}



/* Il faut créer la connexion socket et le channel */




let offlineMode = false /* mettre à faux pour jouer en ligne */
let mouseDown = false
let previousX = 0
let previousY = 0


function sendData(x, y) {
  console.log({x, y})
  draw(x, y)
  // channel.push("position", {x, y}) /* envoie la position de la souris au backend via un channel */
}

function draw(x, y) {
  ctx = canvas.getContext("2d")

  ctx.lineWidth = 5
  ctx.strokeStyle = currentCol
  ctx.lineCap = "round"

  ctx.beginPath()
  ctx.moveTo((previousX > 0) ? previousX : x, (previousY > 0) ? previousY : y)
  ctx.lineTo(x, y)

  ctx.stroke()
  ctx.closePath()

  previousX = x
  previousY = y
}

let canvas = document.getElementsByTagName("canvas")[0]

function getPos(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

loadColorPalette()



canvas.addEventListener("mousedown", function() {mouseDown = true})
canvas.addEventListener("mouseup", function() {mouseDown = false; previousX = previousY = 0})

canvas.addEventListener("mousemove", e =>  {if (mouseDown) {(offlineMode) ? draw(getPos(e).x, getPos(e).y) : sendData(getPos(e).x, getPos(e).y)}})

/* ca va être qqch comme ça pour récupérer les données */
channel.on("position", (pos) => {
  console.log("Position reçue :", pos)

  draw(pos.x, pos.y)
})