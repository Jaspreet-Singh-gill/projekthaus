import api from "../lib/axios.js";
import { buildFormData, multipartHeaders } from "./helpers.js";

class SubtaskService {
  #basePath = "/subtask";

  async createSubtask(projectId, taskId, payload) {
    const response = await api.post(
      `${this.#basePath}/${projectId}/${taskId}/create-subtask`,
      payload,
    );
    return response.data;
  }

  async updateSubtask(projectId, taskId, subTaskId, payload) {
    const response = await api.put(
      `${this.#basePath}/${projectId}/${taskId}/${subTaskId}/update-subtask`,
      payload,
    );
    return response.data;
  }

  async deleteSubtask(projectId, taskId, subTaskId) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/${taskId}/${subTaskId}/delete-subtask`,
    );
    return response.data;
  }

  async getSubtask(projectId, taskId, subTaskId) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/${taskId}/${subTaskId}/get-the-subtask`,
    );
    return response.data;
  }

  async getAllSubtasks(projectId, taskId) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/${taskId}/get-all-subtask`,
    );
    return response.data;
  }

  async assignSubtask(projectId, taskId, subTaskId, payload) {
    const response = await api.post(
      `${this.#basePath}/${projectId}/${taskId}/${subTaskId}/assign-subTask`,
      payload,
    );
    return response.data;
  }

  async deleteAssignedMember(projectId, taskId, subTaskId, payload) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/${taskId}/${subTaskId}/delete-assigned`,
      { data: payload },
    );
    return response.data;
  }

  async updateAssignedSubtask(projectId, taskId, subTaskId, payload) {
    const response = await api.put(
      `${this.#basePath}/${projectId}/${taskId}/${subTaskId}/update-assigned-subtask`,
      payload,
    );
    return response.data;
  }

  async attachFiles(projectId, taskId, subTaskId, files) {
    const formData = buildFormData({}, { filesToSend: files });
    const response = await api.post(
      `${this.#basePath}/${projectId}/${taskId}/${subTaskId}/attach-files-subtask`,
      formData,
      multipartHeaders(),
    );
    return response.data;
  }

  async getAllFiles(projectId, taskId, subTaskId) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/${taskId}/${subTaskId}/get-all-files`,
    );
    return response.data;
  }

  async deleteFile(projectId, taskId, subTaskId, fileId) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/${taskId}/${subTaskId}/${fileId}/delete-the-file`,
    );
    return response.data;
  }
}

const subtaskService = new SubtaskService();

export default subtaskService;
export { SubtaskService };
