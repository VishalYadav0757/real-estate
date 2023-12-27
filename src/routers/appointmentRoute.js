const router = require("express").Router();
const auth = require("../middlewares/auth");
const appointmentController = require("../controllers/appointmentController");

// Create Appointment \\
router.post(
  "/createAppointment",
  auth,
  appointmentController.createAppointment
);

// Read all appointments related to the logged in user/agent \\
router.get(
  "/readAllAppointments",
  auth,
  appointmentController.readAllAppointments
);

// Update appointment related to the logged in user/agent \\
router.patch(
  "/updateAppointment/:id",
  auth,
  appointmentController.updateAppointment
);

// Delete appointment related to the logged in user/agent \\
router.delete(
  "/deleteAppointment/:id",
  auth,
  appointmentController.deleteAppointment
);

module.exports = router;
