import {changeColor} from "js/app.js"
function loadColorPalette() {

    let colorPalette = document.getElementsByClassName("clrpalette")[0]

    const HexColors = [
        "rgb(0, 0, 0)",
        "#f97316",
        "#eab308",
        "#84cc16",
        "#22c55e",
        "#10b981",
        "#14b8a6",
        "#06b6d4",
        "#3b82f6",
        "#6366f1" 
    ];


    for (let i = 0; i <= 10; i++) {

        let node = document.createElement("div")
        node.className = `p-4 rounded-3xl hover:outline-2 hover:outline-violet-400`
        node.addEventListener("click", () => {
            changeColor(HexColors[i])
        })
        node.style.backgroundColor = HexColors[i]

        colorPalette.appendChild(node)
    }
}

export {loadColorPalette}



/* <ul role="list">
  {#each people as person}
    <!-- Remove top/bottom padding when first/last child -->
    <li class="flex py-4 first:pt-0 last:pb-0">
      <img class="h-10 w-10 rounded-full" src={person.imageUrl} alt="" />
      <div class="ml-3 overflow-hidden">
        <p class="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
        <p class="truncate text-sm text-gray-500 dark:text-gray-400">{person.email}</p>
      </div>
    </li>
  {/each}
</ul>*/