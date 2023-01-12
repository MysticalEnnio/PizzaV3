const { createClient } = supabase;

// Create a single supabase client for interacting with your database
const db = createClient(
  "https://bbqmbttgbwghvcoedszb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicW1idHRnYndnaHZjb2Vkc3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk2NTM5OTcsImV4cCI6MTk4NTIyOTk5N30.m8bBPC6TyomyKlIV1GdXPjx4Rl7omnniocPsh5kWiFU"
);

async function signIn(email, password) {
  const userData = await db.auth.signInWithPassword({
    email,
    password,
    options: {
      redirectTo: window.location.origin,
      shouldCreateUser: false,
    },
  });
  if (userData.data.user) {
    window.location.replace("/");
  }
  if (userData.error) {
    if (userData.error.message == "Email not confirmed") {
      window.location.replace("/confirmEmail?email=" + email);
    } else {
      swal("Error!", userData.error.message, "error");
    }
  }
}

async function signInWithGoogle() {
  const userData = await db.auth.signInWithOAuth({
    // provider can be 'github', 'google', 'gitlab', and more
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/verify",
    },
  });
  if (userData.error) {
    swal("Error!", userData.error.message, "error");
  }
}
