import api from "../lib/axios.js";
import { buildFormData, multipartHeaders } from "./helpers.js";

class ProjectService {
  #basePath = "/project";

  async createProject(payload) {
    const response = await api.post(`${this.#basePath}/create-project`, payload);
    return response.data;
  }

  async updateProject(projectId, payload) {
    const response = await api.put(
      `${this.#basePath}/${projectId}/update-project`,
      payload,
    );
    return response.data;
  }

  async getProject(projectId) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/get-the-project`,
    );
    return response.data;
  }

  async deleteProject(projectId) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/delete-project`
    );
    return response.data;
  }

  async listAll() {
    const response = await api.get(`${this.#basePath}/listAll`);
    return response.data;
  }

  async addMember(projectId, payload) {
    const response = await api.post(
      `${this.#basePath}/${projectId}/add-member`,
      payload,
    );
    return response.data;
  }

  async getHtmlForm(projectId, email) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/${encodeURIComponent(email)}/htmlForm`,
      { responseType: "text" },
    );
    return response.data;
  }

  async joinTheProject(projectId, token) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/join-the-project/${token}/`,
    );
    return response.data;
  }

  async joinProject(projectId, fields, avatar = null) {
    const formData = buildFormData(fields, { avatar: avatar ? [avatar] : [] });
    const response = await api.post(
      `${this.#basePath}/${projectId}/join-project`,
      formData,
      multipartHeaders(),
    );
    return response.data;
  }

  async getPeoples(projectId) {
    const response = await api.get(`${this.#basePath}/${projectId}/peoples`);
    return response.data;
  }

  async removeMember(projectId, payload) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/remove-member`,
      { data: payload },
    );
    return response.data;
  }

  async changeRoles(projectId, payload) {
    const response = await api.post(
      `${this.#basePath}/${projectId}/changeroles`,
      payload,
    );
    return response.data;
  }
}

const projectService = new ProjectService();

export default projectService;
export { ProjectService };
