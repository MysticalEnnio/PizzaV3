tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        ghostink: ["GHOSTINK", "cursive"],
      },
      colors: {
        pastel: {
          1: "#01002E",
          2: "#2F72BA",
          3: "#3D9FDD",
          4: "#EFB2EF",
          5: "#D5BAC7",
          6: "#DD74CF",
          7: "#DD53B4",
        },
        rtg: {
          1: "#f87171",
          2: "#fc8a4a",
          3: "#facc15",
          4: "#22c55e",
          5: "#04b989",
          6: "#16532e",
        },
      },
    },
  },
};

let optionInputElement = document.getElementById("optionInput");
let optionsContainer = document.getElementById("optionsWrapper");
let selectableTemplate = document.getElementById("selectableTemplate");

function addOption() {
  let name = (optionInputElement.value + "").trim();
  if (name.length === 0) return;
  optionInputElement.value = "";
  fetch("/api/options/new?name=" + name).then((res) => {
    if (res.status != 400) {
      loadSelectables([name]);
    }
  });
}

function loadSelectables(selectables) {
  selectables.forEach((selectable) => {
    let selectableElement = selectableTemplate.content.cloneNode(true);
    selectableElement.firstElementChild.firstElementChild.textContent =
      selectable;
    optionsContainer.appendChild(selectableElement);
  });
}

function removeSelectable(element) {
  fetch(
    "/api/options/remove?name=" +
      element.parentElement.firstElementChild.textContent
  ).then((res) => {
    if (res.status == 200) element.parentElement.remove();
    else element.parentElement.classList.remove("bg-rtg-1/[.5]");
  });
}

optionInputElement.addEventListener("keydown", (e) => {
  if (e.keyCode == 13) {
    addoption();
  }
});

fetch("/api/options/get")
  .then((res) => res.json())
  .then((data) => {
    loadSelectables(data);
  });
