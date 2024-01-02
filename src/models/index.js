const {
  DB,
  USER,
  PASSWORD,
  HOST,
  dialect,
  pool,
} = require("../config/dbConfig");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(DB, USER, PASSWORD, {
  host: HOST,
  dialect: dialect,
  operatorsAliases: false,
  pool: { ...pool },
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected !!");
  })
  .catch((error) => {
    console.log("Error :-", error);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./userModel")(sequelize, DataTypes);
db.agents = require("./agentModel")(sequelize, DataTypes);
db.properties = require("./propertyModel")(sequelize, DataTypes);
db.appointments = require("./appointmentModel")(sequelize, DataTypes);

db.agents.hasMany(db.properties, {
  foreignKey: "ownerId",
  // Auto delete all properties created by agent, before agent profile gets deleted \\
  onDelete: "cascade",
  hooks: true,
});
db.properties.belongsTo(db.agents, { foreignKey: "ownerId" });

// Auto delete all appointments created by agent, before agent profile gets deleted \\
db.agents.beforeDestroy(async (agent, options) => {
  try {
    await db.appointments.destroy({
      where: { scheduler: agent.name },
    });

    console.log("Appointments deleted successfully for agent!!");
  } catch (e) {
    console.log("Error :-", e);
  }
});

// Auto delete all appointments created by user, before user profile gets deleted \\
db.users.beforeDestroy(async (user, options) => {
  try {
    await db.appointments.destroy({
      where: { scheduler: user.name },
    });

    console.log("Appointments deleted successfully for user!!");
  } catch (e) {
    console.log("Error :-", e);
  }
});

db.sequelize.sync({ force: false }).then(() => {
  console.log("Synced !!");
});

module.exports = db;
