#!/usr/bin/env node

const mongoose = require("mongoose");
const User = require("./schemas/User");
const config = require("./config");
const objs = require("./util/docToObj");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// list all users in the database or specific user when id or username is specified
const listUsers = async (identifier = null) => {
  try {
    if (identifier) {
      // specific user

      const filter = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: identifier }
        : { username: identifier };

      const user = await User.findOne(filter);

      if (user === null) {
        console.log(`No user identified by ${identifier}`);
        return;
      }

      console.log(objs.makeUserObject(user));
    } else {
      // all users
      const allUsers = await User.find();

      if (allUsers.length === 0) {
        console.log("No users");
      } else {
        console.log(`Listing ${allUsers.length} users`);
        console.log(allUsers.map((u) => objs.makeUserObject(u)));
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// create a new user
const createUser = async (username, password, displayName, email, avatar) => {
  try {
    const newUser = new User({
      username,
      password,
      displayName,
      email,
      avatar,
    });

    const insertedUser = await newUser.save();
    console.log("Created new user", objs.makeUserObject(insertedUser));
  } catch (error) {
    console.log("Could not create new user", error);
  }
};

const deleteUser = async (identifier) => {
  try {
    const filter = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { username: identifier };

    const deletedUser = await User.findOneAndRemove(filter);

    if (deletedUser === null) {
      console.log(`No user identified by ${identifier}`);
      return;
    }

    console.log(`Deleted user ${identifier}`);
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (identifier, field, value) => {
  try {
    const filter = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { username: identifier };

    const update = { [field]: value };
    const updatedUser = await User.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (updatedUser === null) {
      console.log(`No user identified by ${identifier}`);
      return;
    }

    console.log(`Updated user ${identifier}`, objs.makeUserObject(updatedUser));
  } catch (error) {
    console.log("Could not update user", error);
  }
};

// script entry point
(async () => {
  // connect to database
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

  // parse command line args
  yargs(hideBin(process.argv))
    .command(
      "list [identifier]",
      "List all or specific user",
      (y) =>
        y.positional("identifier", {
          describe: "User ID or username",
          default: null,
        }),
      async (argv) => {
        await listUsers(argv.identifier);
      }
    )
    .command(
      "create <username> <password> <displayName> [email] [avatar]",
      "Create a new user",
      (y) => {
        y.positional("username", { describe: "Username" });
        y.positional("password", { describe: "Password" });
        y.positional("displayName", { describe: "Name to display in UI" });
        y.positional("email", { describe: "E-Mail address", default: null });
        y.positional("avatar", {
          describe: "URL to user avatar image",
          default: null,
        });
      },
      async (argv) => {
        await createUser(
          argv.username,
          argv.password,
          argv.displayName,
          argv.email,
          argv.avatar
        );
      }
    )
    .command(
      "delete <identifier>",
      "Deletes a user",
      (y) => {
        y.positional("identifier", { describe: "User ID or username" });
      },
      async (argv) => {
        await deleteUser(argv.identifier);
      }
    )
    .command(
      "update <identifier> <field> <value>",
      "Updates a property of a user",
      (y) => {
        y.positional("identifier", {
          describe: "User ID or username",
        });
        y.positional("field", {
          describe: "Name of the property to update",
          choices: ["username", "displayName", "password", "email", "avatar"],
        });
        y.positional("value", {
          describe: "New value for the specified field",
        });
      },
      async (argv) => {
        await updateUser(argv.identifier, argv.field, argv.value);
      }
    )
    .onFinishCommand(() => process.exit(0))
    .help()
    .wrap(72)
    .parse();
})();
