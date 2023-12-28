module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define("property", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    address: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      get() {
        return this.getDataValue("address") || {};
      },
      set(value) {
        this.setDataValue("address", value || {});
      },
    },

    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    area: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    broker: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      get() {
        return this.getDataValue("images") || {};
      },
      set(value) {
        this.setDataValue("images", value || {});
      },
    },

    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // references: {
      //   model: "Agent",
      //   key: "id",
      // },
    },
  });

  // Modify values beforing creating \\
  Property.beforeCreate(async (property, options) => {
    property.name = property.name.trim();
    property.type = property.type.trim();
    property.status = property.status.trim();
    property.owner = property.owner.trim();
    property.broker = property.broker.trim();
  });

  // Modify values beforing updating \\
  Property.beforeUpdate(async (property, options) => {
    if (property.changed("name")) {
      property.name = property.name.trim();
    } else if (property.changed("type")) {
      property.type = property.type.trim();
    } else if (property.changed("status")) {
      property.status = property.status.trim();
    } else if (property.changed("owner")) {
      property.owner = property.owner.trim();
    } else if (property.changed("broker")) {
      property.broker = property.broker.trim();
    }
  });

  return Property;
};
