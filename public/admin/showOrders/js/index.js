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

const swiper = new Swiper(".swiper", {
  loop: false,
  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

var pusher = new Pusher("13fcdedc78efac0503d7", {
  cluster: "eu",
});

var channel = pusher.subscribe("orders");
channel.bind("new-order", function (data) {
  loadOrder(data);
});

let ordersContainer = document.getElementById("ordersWrapper");
let orderTemplate = document.getElementById("orderTemplate");
let optionTemplate = document.getElementById("optionTemplate");
let ingredientsContainer = document.getElementById("ingredientsWrapper");
let optionsContainer = document.getElementById("optionsWrapper");

function loadOrder(order) {
  let orderElement = orderTemplate.content.cloneNode(true).children[0];
  orderElement.querySelector(".orderName").innerHTML = order.name;
  let orderComment = orderElement.querySelector(".orderComment");
  if (order.comment.trim().length == 0) {
    for (let i = 0; i < 3; i++) {
      orderComment.previousElementSibling.remove();
    }
    orderComment.remove();
  } else {
    orderComment.textContent = order.comment;
  }
  let orderOptions = orderElement.querySelector(".optionsWrapper");
  if (order.options.length == 0) {
    for (let i = 0; i < 3; i++) {
      orderOptions.previousElementSibling.remove();
    }
    orderOptions.remove();
  } else {
    order.options.forEach((optionName) => {
      let optionElement = optionTemplate.content.cloneNode(true).children[0];
      optionElement.innerHTML = optionName;
      orderOptions.append(optionElement);
    });
  }
  let orderIngredients = orderElement.querySelector(".ingredientsWrapper");
  orderIngredients.append(document.createElement("div"));
  order.ingredients.forEach((ingredientName) => {
    let ingredient = optionTemplate.content.cloneNode(true).children[0];
    ingredient.innerHTML = ingredientName;
    orderIngredients.append(ingredient);
  });
  ordersContainer.append(orderElement);
  swiper.update();
}

fetch("/api/orders/get")
  .then((res) => res.json())
  .then((data) => {
    console.log("Orders", data);
    data.forEach(loadOrder);
  });
