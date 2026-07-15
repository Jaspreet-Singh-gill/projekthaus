import api from "../lib/axios.js";

class AnalyticsService {
  #basePath = "/analytics";

  async getGlobalAnalytics() {
    const response = await api.get(`${this.#basePath}/global`);
    return response.data;
  }

  async getProjectAnalytics(projectId) {
    const response = await api.get(`${this.#basePath}/project/${projectId}`);
    return response.data;
  }
}

const analyticsService = new AnalyticsService();

export default analyticsService;
export { AnalyticsService };
