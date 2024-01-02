const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  const Agent = sequelize.define("agent", {
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

    property: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const property = this.getDataValue("property");
        return JSON.parse(property);
      },
      set(value) {
        this.setDataValue("property", JSON.stringify(value));
      },
    },
  });

  // Modify values beforing creating \\
  Agent.beforeCreate(async (agent, options) => {
    const trimmedName = agent.name.trim();
    const trimmedPassword = agent.password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 8);

    Object.assign(agent, {
      name: trimmedName,
      password: hashedPassword,
      tokens: JSON.stringify([]),
      property: JSON.stringify([]),
    });
  });

  // Modify values beforing updating \\
  Agent.beforeUpdate(async (agent, options) => {
    if (agent.changed("name")) {
      agent.name = agent.name.trim();
    }

    if (agent.changed("password")) {
      const trimmedPassword = agent.password.trim();
      agent.password = await bcrypt.hash(trimmedPassword, 8);
    }
  });

  // Find agent using email and password \\
  Agent.findByCredentials = async (email, password) => {
    const agent = await Agent.findOne({ email });

    if (!agent) {
      throw new Error("Unable to login !!");
    }

    const isMatch = await bcrypt.compare(password, agent.password);

    if (!isMatch) {
      throw new Error("Unable to login !!");
    }

    return agent;
  };

  // Instance method to generate auth token \\
  Agent.prototype.generateAuthToken = async function () {
    const agent = this;
    const token = jwt.sign(
      { id: agent.id.toString(), userType: "agent" },
      process.env.JWT_SECRET
    );

    try {
      // Get the current tokens as an array
      let tokens = JSON.parse(agent.tokens || "[]");

      // Add a new token object
      tokens.push({ token });

      // Update the 'tokens' field with the updated array by serializing it back to a string
      agent.tokens = JSON.stringify(tokens);

      // Save the updated tokens back to the database
      await agent.save();
    } catch (e) {
      throw new Error("Unable to generate authentication token !!");
    }

    return token;
  };

  // Instance method to exclude sensitive fields from JSON serialization \\
  Agent.prototype.toJSON = function () {
    const { password, tokens, avatar, ...values } = { ...this.get() };

    return values;
  };

  return Agent;
};
