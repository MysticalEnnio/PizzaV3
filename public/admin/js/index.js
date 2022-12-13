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

const changeProfilePicture = (event) => {
  const files = event.target.files;
  const formData = new FormData();
  formData.append("image", files[0]);

  fetch("/api/image/upload/profilePicture", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then(async (data) => {
      console.log(data);
      //change avatar_url supabase user_metadata
      updateProfilePictureData(data.file.url);
    })
    .catch((error) => {
      console.error(error);
    });
};

document.addEventListener("DOMContentLoaded", async () => {
  let userData = (await getUserData()).data.user;
  if (!userData) {
    window.location.replace("/login");
  }
  /*if (!userData) {
    window.location.href = "/login";
  }
  if (!userData.user_metadata.realName) {
    window.location.href = "/createName";
    return;
  }*/
  console.log(userData);

  document.getElementById("editButton").addEventListener("click", () => {
    //click #profilePictureInput
    document.getElementById("profilePictureInput").click();
  });

  document
    .getElementById("profilePictureInput")
    .addEventListener("change", (event) => {
      changeProfilePicture(event);
    });

  document.getElementById("name").innerHTML = userData.user_metadata.realName;

  if (userData.user_metadata.avatar_url) {
    document.getElementById("pPWrapper").firstElementChild.src =
      userData.user_metadata.avatar_url.replace(
        "mystical/",
        "mystical/tr:f-jpg,pr-true/"
      );
  } else {
    let emailHash = md5(userData.email.toLowerCase());
    document.getElementById("pPWrapper").firstElementChild.src =
      "https://www.gravatar.com/avatar/" + emailHash + "?d=mp";
  }
});

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

let currentSession;

fetch("/api/session/get")
  .then((res) => res.text())
  .then((data) => {
    if (data.length == 6 && data != "123456") {
      document.getElementById("continueSession").classList.remove("hidden");
      currentSession = data;
    }
  });

function showCurrentSession() {
  if (currentSession) {
    window.location.href = "/admin/showOrders?id=" + currentSession;
  }
}
