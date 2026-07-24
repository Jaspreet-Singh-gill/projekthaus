import api from "../lib/axios.js";

class NotificationService {
  #basePath = "/notifications";

  async getNotifications() {
    const response = await api.get(this.#basePath);
    return response.data;
  }

  async markAsRead(notificationId) {
    const response = await api.patch(`${this.#basePath}/${notificationId}/read`);
    return response.data;
  }
}

const notificationService = new NotificationService();

export default notificationService;
export { NotificationService };