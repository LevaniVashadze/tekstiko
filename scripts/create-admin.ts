import { createAdminUser } from "../lib/auth-utils";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@tekstiko.com";
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrator";

  console.log(
    "Checking for existing users and creating admin user if needed..."
  );

  try {
    if (!password) {
      console.error("❌ ADMIN_PASSWORD environment variable is not set");
      process.exit(1);
    }
    const user = await createAdminUser(email, password, name);
    if (user) {
      console.log(`✅ Admin user created successfully: ${user.email}`);
    } else {
      console.log(
        "ℹ️  Admin user creation skipped (users already exist or admin already exists)"
      );
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("✅ Admin setup completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Admin setup failed:", error);
    process.exit(1);
  });
