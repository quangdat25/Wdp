const User = require("../models/user.model");

class UserRepository {
  async findById(id) {
    return await User.findById(id);
  }
}

module.exports = new UserRepository();
