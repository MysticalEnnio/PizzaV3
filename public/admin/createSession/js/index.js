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

let selectableTemplate = document.getElementById("selectableTemplate");
let ingredientsContainer = document.getElementById("ingredientsWrapper");
let optionsContainer = document.getElementById("optionsWrapper");

function loadSelectables(selectables, option = false) {
  selectables.forEach((selectable) => {
    let selectableElement =
      selectableTemplate.content.cloneNode(true).children[0];
    selectableElement.innerHTML = selectable;
    if (option) {
      optionsContainer.appendChild(selectableElement);
      return;
    }
    ingredientsContainer.appendChild(selectableElement);
  });
}

function fadeOutSection(section, callback = () => {}) {
  for (let i = 0; i < section.childElementCount; i++) {
    section.children[i].classList.add(
      "transition-all",
      "duration-300",
      "opacity-0",
      "scale-x-105"
    );
    setTimeout(() => {
      section.children[i].classList.add("hidden");
      callback();
    }, 300);
  }
}

function createSession() {
  let ingredients = [],
    options = [];
  for (let i = 0; i < ingredientsContainer.childElementCount; i++) {
    if (ingredientsContainer.children[i].classList.contains("bg-rtg-4/[.5]")) {
      ingredients.push(ingredientsContainer.children[i].textContent);
    }
  }
  for (let i = 0; i < optionsContainer.childElementCount; i++) {
    if (optionsContainer.children[i].classList.contains("bg-rtg-4/[.5]")) {
      options.push(optionsContainer.children[i].textContent);
    }
  }
  console.log(ingredients, options);
  fetch("/api/session/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ingredients,
      options,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.length == 6) {
        window.location.href = "/admin/showOrders?id=" + data;
      }
    });
}
fetch("/api/ingredients/get")
  .then((res) => res.json())
  .then((data) => {
    loadSelectables(data);
  });

fetch("/api/options/get")
  .then((res) => res.json())
  .then((data) => {
    loadSelectables(data, 1);
  });
