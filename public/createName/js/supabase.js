const { createClient } = supabase;

// Create a single supabase client for interacting with your database
const db = createClient(
  "https://bbqmbttgbwghvcoedszb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicW1idHRnYndnaHZjb2Vkc3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk2NTM5OTcsImV4cCI6MTk4NTIyOTk5N30.m8bBPC6TyomyKlIV1GdXPjx4Rl7omnniocPsh5kWiFU"
);

function getUserData() {
  return db.auth.getUser();
}

async function submitName(name) {
  db.auth
    .updateUser({
      data: { realName: name },
    })
    .then((user) => {
      console.log(user);
      if (user.data.user.user_metadata.realName) {
        window.location.replace("/");
        console.log(user.data.user);
      }
    })
    .catch((err) => swal("Error!", err.message, "error"));
}
