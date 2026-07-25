const Notification = require("../models/notification.model");

class NotificationRepository {
  async create(data) {
    return await Notification.create(data);
  }
}

module.exports = new NotificationRepository();
