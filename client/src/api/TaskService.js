import api from "../lib/axios.js";
import { buildFormData, multipartHeaders } from "./helpers.js";

class TaskService {
  #basePath = "/task";

  async createTask(projectId, payload) {
    const response = await api.post(
      `${this.#basePath}/${projectId}/create-task`,
      payload,
    );
    return response.data;
  }

  async updateTask(projectId, taskId, payload) {
    const response = await api.put(
      `${this.#basePath}/${projectId}/${taskId}/update-task`,
      payload,
    );
    return response.data;
  }

  async deleteTask(projectId, taskId) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/${taskId}/delete-task`,
    );
    return response.data;
  }

  async getTask(projectId, taskId) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/${taskId}/get-task`,
    );
    return response.data;
  }

  async getAllTasks(projectId) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/get-all-tasks`,
    );
    return response.data;
  }

  async assignTask(projectId, taskId, payload) {
    const response = await api.post(
      `${this.#basePath}/${projectId}/${taskId}/assign-task`,
      payload,
    );
    return response.data;
  }

  async deleteAssignedMember(projectId, taskId, payload) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/${taskId}/delete-assigned-member`,
      { data: payload },
    );
    return response.data;
  }

  async updateAssignedTask(projectId, taskId, payload) {
    const response = await api.put(
      `${this.#basePath}/${projectId}/${taskId}/updationOfTask`,
      payload,
    );
    return response.data;
  }

  async attachFiles(projectId, taskId, files) {
    const formData = buildFormData({}, { filesToSend: files });
    const response = await api.post(
      `${this.#basePath}/${projectId}/${taskId}/attach-files`,
      formData,
      multipartHeaders(),
    );
    return response.data;
  }

  async getAllFiles(projectId, taskId) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/${taskId}/get-all-files`,
    );
    return response.data;
  }

  async deleteFile(projectId, taskId, fileId) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/${taskId}/${fileId}/delete-the-file`,
    );
    return response.data;
  }
}

const taskService = new TaskService();

export default taskService;
export { TaskService };
