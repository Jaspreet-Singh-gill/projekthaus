import api from "../lib/axios.js";

class CommentService {
  #basePath = "/comment";

  async getComments(projectId, taskId, subtaskId = null) {
    let url = `${this.#basePath}/${projectId}`;
    if (subtaskId) {
        url += `/subtask/${subtaskId}`;
    } else {
        url += `/task/${taskId}`;
    }
    const response = await api.get(url);
    return response.data;
  }

  async addComment(projectId, taskId, subtaskId = null, payload) {
    let url = `${this.#basePath}/${projectId}`;
    if (subtaskId) {
        url += `/subtask/${subtaskId}`;
    } else {
        url += `/task/${taskId}`;
    }
    const response = await api.post(url, payload);
    return response.data;
  }

  async deleteComment(projectId, commentId) {
    const response = await api.delete(
      `${this.#basePath}/${projectId}/${commentId}`
    );
    return response.data;
  }
}

const commentService = new CommentService();

export default commentService;
export { CommentService };
