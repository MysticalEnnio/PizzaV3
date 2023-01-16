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

let orders = [];

var channel = pusher.subscribe("orders");
channel.bind("new-order", function (order) {
  console.log("new order", order);
  order = calculateQueuePower(order);
  orders.push(order);
  deleteAllOrders();
  orders = sortOrders(orders);
  orders.forEach(loadOrder);
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

function deleteAllOrders() {
  ordersContainer.innerHTML = "";
}

fetch("/api/orders/get")
  .then((res) => res.json())
  .then((data) => {
    console.log("Orders", data);
    if (data.length != 0) {
      data.forEach(calculateQueuePower);
      data = sortOrders(data);
      console.log("Sorted Orders", data);
      data.forEach((order) => {
        orders.push(order);
        loadOrder(order);
      });
    }
  });

Array.prototype.insert = function (index, ...items) {
  this.splice(index, 0, ...items);
};

function calculateQueuePower(order) {
  order.queuePower = Math.pow(2, Math.pow(order.priority, 1.12)); //(e.priority - 1) * 2 + 1;
  order.queuePowerToPass = order.queuePower * 1.1;
  console.log(
    `Set queuePower of ${order.name} with priority ${order.priority} to ${order.queuePower}`
  );
  return order;
}

function sortOrders(orders) {
  console.log("Sorting orders...");
  //first take out priority 6, after everything sorted put back in order
  let priorityMaxs = [];
  orders.forEach((e) => {
    if (e.priority > 5) {
      priorityMaxs.push(e);
    }
  });
  orders = orders.filter((e) => e.priority < 6);
  let currentId = 123456;
  orders.forEach((e) => {
    e.id = currentId;
    currentId += 666;
  });
  let queuePowerZero = [];

  while (orders.length - 1 != queuePowerZero.length) {
    for (let i = 1; i < orders.length; i++) {
      if (orders[i].queuePower >= orders[i - 1].queuePowerToPass) {
        orders[i].queuePower -= orders[i - 1].queuePowerToPass;
        let b = orders[i - 1];
        orders[i - 1] = orders[i];
        orders[i] = b;
        console.log(
          `${orders[i - 1].name} used ${orders[i].queuePowerToPass} of his ${
            orders[i - 1].queuePower + orders[i].queuePowerToPass
          } queuePower to pass ${
            orders[i].name
          } and switched his position from ${i} to ${i - 1}`
        );
      } else {
        if (!queuePowerZero.includes(orders[i].id))
          queuePowerZero.push(orders[i].id);
      }
    }
  }

  priorityMaxs.reverse().forEach((e) => orders.unshift(e));
  return orders;
}
