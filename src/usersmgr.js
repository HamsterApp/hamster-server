const mongoose = require("mongoose");
const User = require("./schemas/User");
const config = require("./config");

(async () => {
  const command = process.argv[2];

  mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
  const db = mongoose.connection;

  db.on("error", (err) => {
    console.log(err);
  });

  if (command === "list") {
    // list all users in the database
    try {
      const allUsers = await User.find({});

      if (allUsers.length === 0) {
        console.log("No users");
      } else {
        console.log(`Listing ${allUsers.length} users`);
        console.log(allUsers);
      }
    } catch (e) {
      console.log(e);
    }
  } else if (command === "create") {
    // create new user by supplied data:
    // argv[3] = email
    // argv[4] = name
    // argv[5] = plaintext password

    const username = process.argv[3];
    const display = process.argv[4];
    const passwordPlain = process.argv[5];

    console.log(`Creating new user ${display} (${username})...`);

    const newUser = new User({
      username: username,
      displayName: display,
      password: passwordPlain,
    });

    try {
      const user = await newUser.save();
      console.log(`Created user with ID ${user._id}`);
    } catch (e) {
      console.log("Could not create user");
      console.log(e);
    }
  } else if (command === "delete") {
    const username = process.argv[3];

    try {
      const res = await User.deleteOne({ username: username });

      if (res.deletedCount === 0) {
        console.log(`There is no user with username "${username}"`);
      } else {
        console.log(`Deleted user ${username}`);
      }
    } catch (e) {
      console.log("Could not delete user");
      console.log(e);
    }
  } else if (command === "update") {
    const id = process.argv[3];
    const field = process.argv[4];
    const value = process.argv[5];

    // update user
    const update = {};
    update[field] = value;

    const updatedUser = await User.findOneAndUpdate({ _id: id }, update, {
      new: true,
    });

    if (updatedUser === null) {
      console.log(`There is no user with ID ${id}`);
    } else {
      console.log(`Updated user with ID ${id} to ${updatedUser}`);
    }

    /*if (field !== "username" || field !== "display_name" || field !== "password") {
      // invalid argument for field
      console.log(`Field ${field} is not valid. Allowed values are username, display_name and password`);
    }else {
    }*/
  }
})().finally(() => process.exit(0));
