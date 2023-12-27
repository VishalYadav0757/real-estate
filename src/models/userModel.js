const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(email) {
        this.setDataValue("email", email.toLowerCase());
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isLongEnough(value) {
          if (value.length < 8) {
            throw new Error("Password should be at least 8 characters long !!");
          }
        },
        isNotPassword(value) {
          if (value.toLowerCase() === "password") {
            throw new Error('Password cannot be "password !!"');
          }
        },
      },
    },

    tokens: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[]",
      get() {
        const tokensString = this.getDataValue("tokens");
        return JSON.parse(tokensString);
      },
      set(value) {
        this.setDataValue("tokens", JSON.stringify(value));
      },
    },

    avatar: {
      type: DataTypes.BLOB("long"),
    },
  });

  // Modify values beforing creating \\
  User.beforeCreate(async (user, options) => {
    user.name = user.name.trim();
    user.password = user.password.trim();
    user.password = await bcrypt.hash(user.password, 8);
    user.tokens = JSON.stringify([]);
  });

  // Modify values beforing updating \\
  User.beforeUpdate(async (user, options) => {
    if (user.changed("name")) {
      user.name = user.name.trim();
    } else if (user.changed("password")) {
      user.password = user.password.trim();
      user.password = await bcrypt.hash(user.password, 8);
    }
  });

  // Find user using email and password \\
  User.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Unable to login !!");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Unable to login !!");
    }

    return user;
  };

  // Instance method to generate auth token \\
  User.prototype.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
      { id: user.id.toString(), userType: "user" },
      process.env.JWT_SECRET
    );

    // Get the current tokens as an array
    let tokens = JSON.parse(user.tokens || "[]");

    // Add a new token object
    tokens.push({ token });

    // Update the 'tokens' field with the updated array by serializing it back to a string
    user.tokens = JSON.stringify(tokens);

    // Save the updated tokens back to the database
    await user.save();

    return token;
  };

  // Instance method to exclude sensitive fields from JSON serialization \\
  User.prototype.toJSON = function () {
    const values = { ...this.get() };

    delete values.password;
    delete values.tokens;
    delete values.avatar;

    return values;
  };

  return User;
};
