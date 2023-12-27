const jwt = require("jsonwebtoken");
const db = require("../models");

const User = db.users;
const Agent = db.agents;

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;

    if (decoded.userType === "user") {
      user = await User.findOne({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      req.user = user;
    } else if (decoded.userType === "agent") {
      user = await Agent.findOne({
        where: {
          id: decoded.id,
        },
      });

      if (!user) {
        throw new Error("Agent not found");
      }

      req.agent = user;
    } else {
      throw new Error("Invalid userType");
    }

    const userTokens = JSON.parse(user.tokens);

    const tokenExists = userTokens.some(
      (userToken) => userToken.token === token
    );

    if (!tokenExists) {
      throw new Error();
    }

    req.token = token;

    next();
  } catch (e) {
    res.status(400).send("Please authenticate !!");
  }
};

module.exports = auth;
