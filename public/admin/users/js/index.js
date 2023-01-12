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

let usersContainer = document.getElementById("usersWrapper");
let userTemplate = document.getElementById("userTemplate");
let userEditDropdownElement = document.getElementById("userEditDropdown");

let userEditUser;

function getAllUsers() {
  return new Promise((resolve, reject) => {
    fetch("/api/users/getAll")
      .then((res) => res.json())
      .then((data) => {
        resolve(data.data.users);
      })
      .catch((err) => reject(err));
  });
}

getAllUsers().then((users) => {
  console.log(users);
  users.forEach(loadUser);
});

function loadUser(user) {
  let userElement = userTemplate.content.cloneNode(true);
  userElement.querySelector(".userProfilePicture").src =
    user.user_metadata.avatar_url;
  userElement.querySelector(".userName").textContent =
    user.user_metadata.realName ||
    user.user_metadata.name ||
    user.user_metadata.full_name;
  userElement.querySelector(".userEmail").textContent = user.email;
  userElement.querySelector(".userRole").textContent = user.user_metadata
    .isPizzaCreator
    ? "Admin"
    : "User";
  userElement
    .querySelector(".userEdit")
    .addEventListener("click", showUserDropdown);
  usersContainer.appendChild(userElement);
}

function showUserDropdown(event) {
  let x = event.clientX;
  let y = event.clientY;
  userEditDropdownElement.style.left = `${x + 20}px`;
  userEditDropdownElement.style.top = `${y}px`;
  userEditDropdownElement.classList.remove("hidden");
  userEditUser = event.target;
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (e) => {
    if (
      !e.target.classList.contains("userEdit") &&
      e.target.parentElement.id != "userEditDropdown"
    )
      userEditDropdownElement.classList.add("hidden");
  });
});
