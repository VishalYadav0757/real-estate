const db = require("../models");

// Create main model \\
const Appointment = db.appointments;

// Create Appointment \\
const createAppointment = async (req, res) => {
  try {
    const { scheduler, reason, date, duration, time, members } = req.body;

    const userName = req?.user?.name;
    const agentName = req?.agent?.name;

    let info = {
      scheduler: scheduler || userName || agentName,
      reason,
      date,
      duration,
      time,
      members,
    };

    const appointment = await Appointment.create(info);
    const roomId = await appointment.generateRoomId();

    res.status(201).send({ appointment, roomId });
  } catch (e) {
    res.status(400).send(e);
  }
};

// Read All Appointments related to the logged in user/agent \\
const readAllAppointments = async (req, res) => {
  try {
    const userName = req?.user?.name;
    const agentName = req?.agent?.name;

    const appointments = await Appointment.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { scheduler: userName || agentName },
          {
            members: {
              [db.Sequelize.Op.like]: `%${userName || agentName}%`,
            },
          },
        ],
      },
    });

    res.status(200).send(appointments);
  } catch (e) {
    res.status(500).send(e);
  }
};

// Update appointment related to the logged in user/agent \\
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userName = req?.user?.name;
    const agentName = req?.agent?.name;

    // Find the appointment
    const appointment = await Appointment.findByPk(id);

    // Check if the appointment exists
    if (!appointment) {
      return res.status(404).send({ error: "No record found !!" });
    }

    // Check if the logged-in user/agent is the scheduler of this appointment
    if (
      appointment.scheduler !== userName &&
      appointment.scheduler !== agentName
    ) {
      return res.status(403).send({
        error: "You are not authorized to update this appointment !!",
      });
    }

    // Convert req.body object to array of keys
    const updates = Object.keys(req.body);

    // Only these property values can be updated
    const allowedUpdates = ["reason", "date", "duration", "time", "members"];

    // Check if the property value being updated is valid or not
    const isValid = updates.every((item) => allowedUpdates.includes(item));

    // If not valid throw error
    if (!isValid) {
      return res.status(400).send({ error: "Cannot update property !!" });
    }

    updates.forEach((item) => (appointment[item] = req.body[item]));

    await appointment.save();

    res.status(200).send(appointment);
  } catch (e) {
    res.status(400).send(e);
  }
};

// Delete appointment related to the logged in user/agent \\
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userName = req?.user?.name;
    const agentName = req?.agent?.name;

    // Find the appointment
    const appointment = await Appointment.findByPk(id);

    // Check if the appointment exists
    if (!appointment) {
      return res.status(404).send({ error: "No record found !!" });
    }

    // Check if the logged-in user/agent is the scheduler of this appointment
    if (
      appointment.scheduler !== userName &&
      appointment.scheduler !== agentName
    ) {
      return res.status(403).send({
        error: "You are not authorized to delete this appointment !!",
      });
    }

    // Delete the appointment
    await appointment.destroy();

    res.status(200).send(appointment);
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  createAppointment,
  readAllAppointments,
  updateAppointment,
  deleteAppointment,
};
