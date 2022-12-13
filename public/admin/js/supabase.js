const { createClient } = supabase;

// Create a single supabase client for interacting with your database
const db = createClient(
  "https://bbqmbttgbwghvcoedszb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicW1idHRnYndnaHZjb2Vkc3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk2NTM5OTcsImV4cCI6MTk4NTIyOTk5N30.m8bBPC6TyomyKlIV1GdXPjx4Rl7omnniocPsh5kWiFU"
);

function getUserData() {
  return db.auth.getUser();
}

async function signOut() {
  fetch("/api/user/logout");
  const { error } = await db.auth.signOut();
  if (error) {
    swal("Error!", error.message, "error");
    return;
  }
  window.location.href = "/login";
}

async function updateProfilePictureData(url) {
  const { user, error } = await db.auth.updateUser({
    data: { avatar_url: url },
  });
  document.getElementById("profilePicture").src = url.replace(
    "mystical/",
    "mystical/tr:f-jpg,pr-true/"
  );
}
