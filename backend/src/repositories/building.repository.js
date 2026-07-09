const Building = require("../models/building.model");

class BuildingRepository {
  async findById(id) {
    return await Building.findById(id);
  }
}

module.exports = new BuildingRepository();
