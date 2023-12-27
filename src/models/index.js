const dbConfig = require("../config/dbConfig");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
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

db.agents.hasMany(db.properties, { foreignKey: "ownerId" });
db.properties.belongsTo(db.agents, { foreignKey: "ownerId" });

db.sequelize.sync({ force: false }).then(() => {
  console.log("Synced !!");
});

module.exports = db;
