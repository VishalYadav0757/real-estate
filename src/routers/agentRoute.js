const router = require("express").Router();
const multer = require("multer");
const auth = require("../middlewares/auth");
const agentController = require("../controllers/agentController");

// Create Agent \\
router.post("/createAgent", agentController.createAgent);

// Login Agent \\
router.post("/loginAgent", agentController.loginAgent);

// Logout Agent \\
router.post("/logoutAgent", auth, agentController.logoutAgent);

// Read Agent Profile \\
router.get("/readAgentProfile", auth, agentController.readAgentProfile);

// Update Agent Profile \\
router.patch("/updateAgentProfile", auth, agentController.updateAgentProfile);

// Upload Agent Profile Picture \\
const upload = multer({
  limits: {
    fileSize: 1000000,
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image file !!"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/uploadAgentProfilePicture",
  auth,
  upload.single("avatar"),
  agentController.uploadAgentProfilePicture
);

// Display Agent Profile Picture \\
router.get(
  "/displayAgentProfilePicture",
  auth,
  agentController.displayAgentProfilePicture
);

// Delete Agent Profile Picture \\
router.delete(
  "/deleteAgentProfilePicture",
  auth,
  agentController.deleteAgentProfilePicture
);

// Delete Agent Profile \\
router.delete("/deleteAgentProfile", auth, agentController.deleteAgentProfile);

module.exports = router;
