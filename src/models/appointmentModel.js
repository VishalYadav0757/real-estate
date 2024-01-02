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
    const propertiesToTrim = ["scheduler", "reason", "duration", "time"];

    propertiesToTrim.forEach((prop) => {
      if (appointment.changed(prop)) {
        appointment[prop] = appointment[prop].trim();
      }
    });
  });

  // Modify values beforing updating \\
  Appointment.beforeUpdate(async (appointment, options) => {
    const propertiesToTrim = ["reason", "duration", "time", "scheduler"];

    propertiesToTrim.forEach((prop) => {
      if (appointment.changed(prop)) {
        appointment[prop] = appointment[prop].trim();
      }
    });
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
