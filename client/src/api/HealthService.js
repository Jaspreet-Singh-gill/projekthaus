import api from "../lib/axios.js";

class HealthService {
  #basePath = "/healthcheck";

  async check() {
    const response = await api.get(`${this.#basePath}/`);
    return response.data;
  }
}

const healthService = new HealthService();

export default healthService;
export { HealthService };
