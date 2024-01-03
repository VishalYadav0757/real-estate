const db = require("../models");

// Create main model \\
const Agent = db.agents;
const Property = db.properties;

// Create Property \\
const createProperty = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      type,
      price,
      area,
      status,
      owner,
      broker,
      images,
      ownerId,
    } = req.body;

    const agentId = req?.agent?.id;
    const agentName = req?.agent?.name;

    if (!(agentId || agentName)) {
      return res.status(400).send({ error: "Cannot create property !!" });
    }

    let info = {
      name,
      description,
      address,
      type,
      price,
      area,
      status,
      owner: owner || agentName,
      broker: broker || agentName,
      images,
      ownerId: ownerId || agentId,
    };

    const newProperty = await Property.create(info);

    const agentData = await Agent.findByPk(agentId);
    const agentProperties = JSON.parse(agentData.property || "[]");

    agentProperties.push({ property: newProperty.name });
    agentData.property = JSON.stringify(agentProperties);

    await agentData.save();

    res.status(201).send(newProperty);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Read All Properties \\
const readAllProperties = async (req, res) => {
  try {
    const { sortBy, skip, limit, status } = req.query;

    let order = [["createdAt", "DESC"]]; // Default sorting by createdAt in descending order
    let pagination = {};
    let whereCondition = {};

    // Customize sorting based on the provided query parameter
    if (sortBy) {
      const [sortFor, sortOrder] = sortBy.split(":");

      if (
        sortFor &&
        sortOrder &&
        ["asc", "desc"].includes(sortOrder.toLowerCase())
      ) {
        order = [[sortFor, sortOrder.toUpperCase()]];
      }
    }

    // To skip the result set
    if (skip) {
      pagination.offset = parseInt(skip);
    }

    // To limit the number of results to be shown
    if (limit) {
      pagination.limit = parseInt(limit);
    }

    // To filter based on the status of the property
    if (status) {
      whereCondition.status = status; // Filter by status if provided
    }

    const allProperties = await Property.findAll({
      where: whereCondition,
      order,
      ...pagination,
    });

    res.status(200).send(allProperties);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Read Property \\
const readProperty = async (req, res) => {
  try {
    const id = req.params.id;

    const property = await Property.findOne({ where: { id } });

    if (!property) {
      return res.status(404).send({ error: "No record found !!" });
    }

    res.status(200).send(property);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Update Property \\
const updateProperty = async (req, res) => {
  try {
    // Check if agent is trying to update the property
    const agentId = req?.agent?.id;
    const agentName = req?.agent?.name;

    // If not agent then throw error
    if (!(agentId || agentName)) {
      return res.status(400).send({ error: "Cannot update property !!" });
    }

    // Convert req.body object to array of keys
    const updates = Object.keys(req.body);

    // Only these property values can be updated
    const allowedUpdates = [
      "name",
      "description",
      "address",
      "type",
      "price",
      "area",
      "status",
      "owner",
      "images",
    ];

    // Check if the property value being updated is valid or not
    const isValid = updates.every((item) => allowedUpdates.includes(item));

    // If not valid throw error
    if (!isValid) {
      return res.status(400).send({ error: "Cannot update property !!" });
    }

    // Find the property to be updated
    const property = await Property.findOne({ where: { id: req.params.id } });

    // If no property found throw error
    if (!property) {
      return res.status(404).send({ error: "No record found !!" });
    }

    // Check if the agent updating the property values is the one who created it
    if (property.ownerId !== agentId) {
      return res
        .status(401)
        .send({ error: "Unauthorized to update this property !!" });
    }

    if (updates.includes("name")) {
      // Check if the name is being updated
      const existingProperty = await Property.findOne({
        where: { name: req.body.name },
      });

      // Check if the name being updated is already present
      if (existingProperty && existingProperty.id !== req.params.id) {
        return res
          .status(400)
          .send({ error: "Property name already exists !!" });
      }

      // Find authorized agent data
      const agentData = await Agent.findByPk(agentId);
      const agentProperties = JSON.parse(agentData.property || "[]");

      // Find the index of the property that needs to be updated
      const index = agentProperties.findIndex(
        (prop) => prop.property === property.name
      );

      // Update the existing property name
      if (index !== -1) {
        agentProperties[index].property = req.body.name;
        agentData.property = JSON.stringify(agentProperties);

        await agentData.save();
      }

      property.name = req.body.name; // Update the name in the property object
    }

    // Update other values that are being provided
    updates.forEach((item) => (property[item] = req.body[item]));

    // Save the new property details
    await property.save();

    res.status(200).send(property);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Delete Property \\
const deleteProperty = async (req, res) => {
  try {
    // Check if agent is trying to delete the property
    const agentId = req?.agent?.id;
    const agentName = req?.agent?.name;

    // If not agent then throw error
    if (!(agentId || agentName)) {
      return res.status(400).send({ error: "Cannot delete property !!" });
    }

    // Find the property that needs to be deleted based on the id provided in the request params
    const property = await Property.findOne({ where: { id: req.params.id } });

    // Check if that property even exists
    if (!property) {
      return res.status(404).send({ error: "No record found !!" });
    }

    // Check if the authenticated agent owns the property
    if (property.ownerId !== agentId) {
      return res
        .status(401)
        .send({ error: "Unauthorized to delete this property !!" });
    }

    // Remove property name from Agent's properties list
    const agentData = await Agent.findByPk(agentId);
    const agentProperties = JSON.parse(agentData.property || "[]");

    const index = agentProperties.findIndex(
      (prop) => prop.property === property.name
    );

    if (index !== -1) {
      agentProperties.splice(index, 1);
      agentData.property = JSON.stringify(agentProperties);

      await agentData.save();
    }

    // Delete property from Property table
    await property.destroy();

    res.status(200).send(property);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  createProperty,
  readAllProperties,
  readProperty,
  updateProperty,
  deleteProperty,
};
