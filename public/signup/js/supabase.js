const { createClient } = supabase;

// Create a single supabase client for interacting with your database
const db = createClient(
  "https://bbqmbttgbwghvcoedszb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicW1idHRnYndnaHZjb2Vkc3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk2NTM5OTcsImV4cCI6MTk4NTIyOTk5N30.m8bBPC6TyomyKlIV1GdXPjx4Rl7omnniocPsh5kWiFU"
);

async function signUp(email, password, realName) {
  const userData = await db.auth.signUp({
    email,
    password,
    options: {
      data: {
        realName: true,
      },
    },
  });
  console.log(userData);
  if (userData.data.user) {
    //set id cookie
    document.cookie = `id=${userData.data.user.id}; path=/`;
    const userData2 = await db.auth.signInWithPassword({
      email,
      password,
      options: {
        redirectTo: window.location.origin + "/verify",
      },
    });
    if (userData2.error) {
      console.log("UserData2 error", userData2);
      window.location.replace(
        "/confirmEmail?email=" + userData.data.user.email
      );
    } else {
      window.location.replace("/verify");
    }
  }
  if (userData.error) {
    swal("Error!", userData.error.message, "error");
  }
}

async function signUpWithGoogle() {
  const userData = await db.auth.signInWithOAuth({
    // provider can be 'github', 'google', 'gitlab', and more
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/createName",
      shouldCreateUser: false,
    },
  });
  if (userData.error) {
    swal("Error!", userData.error.message, "error");
  }
}
