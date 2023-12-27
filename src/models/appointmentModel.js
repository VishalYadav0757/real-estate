module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define("appointment", {
    scheduler: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    duration: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    members: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      get() {
        return this.getDataValue("members") || {};
      },
      set(value) {
        this.setDataValue("members", value || {});
      },
    },

    roomId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
  });

  // Modify values beforing creating \\
  Appointment.beforeCreate(async (appointment, options) => {
    appointment.scheduler = appointment.scheduler.trim();
    appointment.reason = appointment.reason.trim();
    appointment.duration = appointment.duration.trim();
    appointment.time = appointment.time.trim();
  });

  // Modify values beforing updating \\
  Appointment.beforeUpdate(async (appointment, options) => {
    if (appointment.changed("reason")) {
      appointment.reason = appointment.reason.trim();
    } else if (appointment.changed("duration")) {
      appointment.duration = appointment.duration.trim();
    } else if (appointment.changed("time")) {
      appointment.time = appointment.time.trim();
    } else if (appointment.changed("scheduler")) {
      appointment.scheduler = appointment.scheduler.trim();
    }
  });

  // Instance method to generate room id \\
  Appointment.prototype.generateRoomId = async function () {
    const appointment = this;

    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);

      result += characters.charAt(randomIndex);
    }

    appointment.roomId = result;

    await appointment.save();

    return result;
  };

  return Appointment;
};
