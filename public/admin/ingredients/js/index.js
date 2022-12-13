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

let ingredientInputElement = document.getElementById("ingredientInput");
let ingredientsContainer = document.getElementById("ingredientsWrapper");
let selectableTemplate = document.getElementById("selectableTemplate");

function addIngredient() {
  let name = (ingredientInputElement.value + "").trim();
  if (name.length === 0) return;
  fetch("/api/ingredients/new?name=" + name).then((res) => {
    if (res.status != 400) {
      loadSelectables([name]);
    }
    ingredientInputElement.value = "";
  });
}

function loadSelectables(selectables) {
  selectables.forEach((selectable) => {
    let selectableElement = selectableTemplate.content.cloneNode(true);
    selectableElement.firstElementChild.firstElementChild.textContent =
      selectable;
    ingredientsContainer.appendChild(selectableElement);
  });
}

function removeSelectable(element) {
  fetch(
    "/api/ingredients/remove?name=" +
      element.parentElement.firstElementChild.textContent
  ).then((res) => {
    if (res.status == 200) element.parentElement.remove();
    else element.parentElement.classList.remove("bg-rtg-1/[.5]");
  });
}

ingredientInputElement.addEventListener("keydown", (e) => {
  if (e.keyCode == 13) {
    addIngredient();
  }
});

fetch("/api/ingredients/get")
  .then((res) => res.json())
  .then((data) => {
    loadSelectables(data);
  });
