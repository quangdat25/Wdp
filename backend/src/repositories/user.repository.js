const User = require("../models/user.model");

class UserRepository {
  async findById(id) {
    return await User.findById(id);
  }

  async findByIdLean(id) {
    return await User.findById(id).lean();
  }
}

module.exports = new UserRepository();
