import api from "../lib/axios.js";
import { buildFormData, multipartHeaders } from "./helpers.js";

class NotesService {
  #basePath = "/notes";

  async createNote(projectId, payload) {
    const response = await api.post(
      `${this.#basePath}/${projectId}/create-note`,
      payload,
    );
    return response.data;
  }

  async updateNote(projectId, noteId, payload) {
    const response = await api.put(
      `${this.#basePath}/${projectId}/${noteId}/update-note`,
      payload,
    );
    return response.data;
  }

  async deleteNote(projectId, noteId) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/${noteId}/delete-note`,
    );
    return response.data;
  }

  async listNotes(projectId) {
    const response = await api.get(`${this.#basePath}/${projectId}/list-notes`);
    return response.data;
  }

  async getNote(projectId, noteId) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/${noteId}/get-note`,
    );
    return response.data;
  }

  async attachFiles(projectId, noteId, files) {
    const formData = buildFormData({}, { filesToSend: files });
    const response = await api.post(
      `${this.#basePath}/${projectId}/${noteId}/attach-files`,
      formData,
      multipartHeaders(),
    );
    return response.data;
  }

  async getAllFiles(projectId, noteId) {
    const response = await api.get(
      `${this.#basePath}/${projectId}/${noteId}/files`,
    );
    return response.data;
  }

  async deleteFile(projectId, noteId, fileId) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/${noteId}/files/${fileId}`,
    );
    return response.data;
  }
}


const notesService = new NotesService();

export default notesService;
export { NotesService };
