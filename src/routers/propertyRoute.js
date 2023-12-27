const router = require("express").Router();
const auth = require("../middlewares/auth");
const propertyController = require("../controllers/propertyController");

// Create Property \\
router.post("/createProperty", auth, propertyController.createProperty);

// Read All Properties \\
router.get("/readAllProperties", auth, propertyController.readAllProperties);

// Read Property \\
router.get("/readProperty/:id", auth, propertyController.readProperty);

// Update Property \\
router.patch("/updateProperty/:id", auth, propertyController.updateProperty);

// Delete Property \\
router.delete("/deleteProperty/:id", auth, propertyController.deleteProperty);

module.exports = router;
