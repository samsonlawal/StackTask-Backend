const bcrypt = require("bcrypt");

(async () => {
  const old = "$2b$10$6eURa1YjDLbXErgnqXMwUOq5thjT3HmTd4/7YD7ZSRP5GMBthdJkK";
  const password = "Password@123";

  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);

  console.log("Hashed password:", hash);
})();
