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
let deleteUserButton = document.getElementById("deleteUserButton");
let changeUserNameButton = document.getElementById("changeUserNameButton");

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
  userElement.querySelector("tr").dataset.userid = user.id;
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
  userEditDropdownElement.classList.remove("hidden");
  if (screen.orientation.type == "portrait-primary") {
    userEditDropdownElement.style.left = `${
      x - 20 - userEditDropdownElement.offsetWidth
    }px`;
    userEditDropdownElement.style.top = `${y - 20}px`;
  } else {
    userEditDropdownElement.style.left = `${x + 20}px`;
    userEditDropdownElement.style.top = `${y}px`;
  }
  userEditUser = event.target?.parentElement.parentElement.dataset.userid;
}

document.addEventListener("click", (e) => {
  if (
    !e.target.classList.contains("userEdit") &&
    e.target.parentElement.id != "userEditDropdown"
  )
    userEditDropdownElement.classList.add("hidden");
});

function saveUserData(id, opt) {
  return new Promise((resolve, reject) => {
    fetch(`/api/user/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, data: opt }),
    })
      .then((res) => res.json())
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        resolve(undefined);
        swal("Error!", err.message, "error");
      });
  });
}

function deleteUser(id) {
  return new Promise((resolve, reject) => {
    fetch(`/api/user/delete?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        resolve(undefined);
        swal("Error!", err.message, "error");
      });
  });
}

deleteUserButton.addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete user!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      console.log(userEditUser);
      const data = await deleteUser(userEditUser);
      if (!data) return;
      Swal.fire("Deleted!", "The user has been deleted.", "success");
    }
  });
});

changeUserNameButton.addEventListener("click", async () => {
  const { value: name } = await Swal.fire({
    title: "Enter new name",
    input: "text",
    inputValue: "",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    inputValidator: (value) => {
      if (value.length < 2) {
        return "The name must be at least 2 characters long";
      }
    },
  });
  if (!name) return;

  console.log("namen", name);
  const data = await saveUserData(userEditUser, {
    user_metadata: { realName: name, name: name },
  });

  if (data)
    //Show success message using swal with icon success
    Swal.fire("Changed!", `The users name been changed to ${name}.`, "success");
});
