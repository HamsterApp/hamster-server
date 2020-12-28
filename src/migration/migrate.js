#!/usr/bin/env node
const mongoose = require("mongoose");
const config = require("../config");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { boolean } = require("yargs");
const Category = require("../schemas/Category");
const Group = require("../schemas/Group");
const HistoryEntry = require("../schemas/HistoryEntry");
const Item = require("../schemas/Item");
const StockEntry = require("../schemas/StockEntry");
const StorageLocation = require("../schemas/StorageLocation");
const Tag = require("../schemas/Tag");
const Unit = require("../schemas/Unit");
const NutrimentType = require("../schemas/NutrimentType");
const User = require("../schemas/User");

// perform migration and optional database wipe
const migrateData = async (locale, wipe) => {
  if (wipe) {
    console.log("Wiping database before migration...");
    // remove all schema entries
    await Category.deleteMany({});
    await Group.deleteMany({});
    await HistoryEntry.deleteMany({});
    await Item.deleteMany({});
    await StockEntry.deleteMany({});
    await StorageLocation.deleteMany({});
    await Unit.deleteMany({});
    await User.deleteMany({});
    await Tag.deleteMany({});
    console.log("Database wiped");
  }

  const data = require(`./data_${locale}.json`);

  // categories
  if (data.categories) {
    console.log("Creating categories...");

    for (const c of data.categories) {
      const e = new Category(c);
      try {
        const exists = (await Category.findOne({ name: c.name })) !== null;

        if (!exists) {
          // insert category
          await e.save();
        } else {
          console.log(`Category with name ${c.name} already exists. Skipping`);
        }
      } catch (error) {
        console.log("Could not create category", c, error);
      }
    }

    console.log("Categories created");
  }

  // groups
  if (data.groups) {
    console.log("Creating groups...");

    for (const c of data.groups) {
      const e = new Group(c);
      try {
        const exists = (await Group.findOne({ name: c.name })) !== null;

        if (!exists) {
          // insert group
          await e.save();
        } else {
          console.log(`Group with name ${c.name} already exists. Skipping`);
        }
      } catch (error) {
        console.log("Could not create group", c, error);
      }
    }

    console.log("Groups created");
  }

  // tags
  if (data.tags) {
    console.log("Creating tags...");

    for (const c of data.tags) {
      const e = new Tag(c);
      try {
        const exists = (await Tag.findOne({ label: c.label })) !== null;

        if (!exists) {
          // insert tag
          await e.save();
        } else {
          console.log(`Tag with label ${c.label} already exists. Skipping`);
        }
      } catch (error) {
        console.log("Could not create tag", c, error);
      }
    }
    console.log("Tags created");
  }

  // units
  if (data.units) {
    console.log("Creating units...");

    for (const c of data.units) {
      const e = new Unit(c);
      try {
        const exists = (await Unit.findOne({ symbol: c.symbol })) !== null;

        if (!exists) {
          // insert unit
          await e.save();
        } else {
          console.log(`Unit with symbol ${c.symbol} already exists. Skipping`);
        }
      } catch (error) {
        console.log("Could not create unit", c, error);
      }
    }
    console.log("Units created");
  }

  // nutriment types
  if (data.nutrimentTypes) {
    console.log("Creating nutriment types... ");

    for (const c of data.nutrimentTypes) {
      const e = new NutrimentType(c);
      try {
        const exists = (await NutrimentType.findOne({ key: c.key })) !== null;

        if (!exists) {
          // insert user
          await e.save();
        } else {
          console.log(
            `Nutriment type with key ${c.key} already exists. Skipping`
          );
        }
      } catch (error) {
        console.log("Could not create nutriment type", c, error);
      }
    }
    console.log("Nutriment types created");
  }

  // users
  if (data.users) {
    console.log("Creating users...");

    for (const c of data.users) {
      const e = new User(c);
      try {
        const exists = (await User.findOne({ username: c.username })) !== null;

        if (!exists) {
          // insert user
          await e.save();
        } else {
          console.log(
            `User with username ${c.username} already exists. Skipping`
          );
        }
      } catch (error) {
        console.log("Could not create user", c, error);
      }
    }
    console.log("Users created");
  }

  console.log("Migration complete");
};

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
      "$0 [locale] [wipe]",
      "Start database migration",
      (y) => {
        y.positional("locale", {
          describe: "Locale for the data to use",
          choices: ["en", "de"],
          default: "de",
        });
        y.positional("wipe", {
          describe: "Wipe database before migration?",
          type: boolean,
          default: false,
        });
      },
      async (argv) => {
        await migrateData(argv.locale, argv.wipe);
      }
    )
    .onFinishCommand(() => process.exit(0))
    .help()
    .wrap(72)
    .parse();
})();
