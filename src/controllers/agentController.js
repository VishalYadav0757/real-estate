const sharp = require("sharp");
const db = require("../models");

// Create main model \\
const Agent = db.agents;

// Create Agent \\
const createAgent = async (req, res) => {
  let info = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const agent = await Agent.create(info);
    const token = await agent.generateAuthToken();

    res.status(201).send({ agent, token });
  } catch (e) {
    res.status(400).send(e);
  }
};

// Login Agent \\
const loginAgent = async (req, res) => {
  try {
    const agent = await Agent.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await agent.generateAuthToken();

    res.status(200).send({ agent, token });
  } catch (e) {
    res.status(400).send({ error: "Oops, Something went wrong !!" });
  }
};

// Logout Agent \\
const logoutAgent = async (req, res) => {
  try {
    const agentTokens = JSON.parse(req.agent.tokens);

    req.agent.tokens = JSON.stringify(
      agentTokens.filter((tokenObj) => tokenObj.token !== req.token)
    );

    await req.agent.save();

    res.status(200).send(req.agent);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Read Agent Profile \\
const readAgentProfile = async (req, res) => {
  try {
    res.status(200).send(req.agent);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Update Agent Profile \\
const updateAgentProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValid = updates.every((item) => allowedUpdates.includes(item));

  if (!updates?.length > 0 || !isValid) {
    return res.status(400).send({ error: "Not a valid property to update !!" });
  }

  try {
    updates.forEach((item) => (req.agent[item] = req.body[item]));

    await req.agent.save();

    res.status(200).send(req.agent);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Upload Agent Profile Picture \\
const uploadAgentProfilePicture = async (req, res) => {
  try {
    if (!req?.file?.buffer) {
      return res.status(404).send({ error: "Please select an image file!!" });
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.agent.avatar = buffer;

    await req.agent.save();

    res.status(200).send(req.agent);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Display Agent Profile Picture \\
const displayAgentProfilePicture = async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.agent.id);

    if (!agent || !agent.avatar) {
      throw new Error("Oops, Something went wrong !!");
    }

    res.set("Content-Type", "image/png");

    res.status(200).send(agent.avatar);
  } catch (e) {
    res.status(404).send({ error: "Oops, Something went wrong !!" });
  }
};

// Delete Agent Profile Picture \\
const deleteAgentProfilePicture = async (req, res) => {
  try {
    req.agent.avatar = null;

    await req.agent.save();

    res.status(200).send(req.agent);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Delete Agent Profile \\
const deleteAgentProfile = async (req, res) => {
  try {
    await req.agent.destroy();

    res.status(200).send(req.agent);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  createAgent,
  loginAgent,
  logoutAgent,
  readAgentProfile,
  updateAgentProfile,
  uploadAgentProfilePicture,
  displayAgentProfilePicture,
  deleteAgentProfilePicture,
  deleteAgentProfile,
};
