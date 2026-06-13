import api from "../lib/axios.js";
import { buildFormData, multipartHeaders } from "./helpers.js";

class AuthService {
  #basePath = "/auth";

  async register(fields, avatar = null) {
    const formData = buildFormData(fields, { avatar: avatar ? [avatar] : [] });
    const response = await api.post(
      `${this.#basePath}/register`,
      formData,
      multipartHeaders(),
    );
    return response.data;
  }

  async verifyEmailAddress(token) {
    const response = await api.get(
      `${this.#basePath}/verify-email-address/${token}/`,
    );
    return response.data;
  }



  async login(credentials) {
    const response = await api.post(`${this.#basePath}/login`, credentials);
    return response.data;
  }

  async forgetPassword(payload) {
    const response = await api.post(`${this.#basePath}/forget-password`, payload);
    return response.data;
  }

  async resetPassword(token, payload) {
    const response = await api.post(
      `${this.#basePath}/reset-password/${token}/`,
      payload,
    );
    return response.data;
  }

  // async refreshTokens() {
  //   const response = await api.get(`${this.#basePath}/refreshTokens`);
  //   return response.data;
  // }

  // does not need because it is automatically managed using axios request

  async resendEmailVerification() {
    const response = await api.get(`${this.#basePath}/resendEmailVerification`);
    return response.data;
  }

  async logout() {
    const response = await api.get(`${this.#basePath}/logout`);
    return response.data;
  }

  async changeAvatar(avatar) {
    const formData = buildFormData({}, { avatar: [avatar] });
    const response = await api.post(
      `${this.#basePath}/change-avatar`,
      formData,
      multipartHeaders(),
    );
    return response.data;
  }

  async updateInfo(payload) {
    const response = await api.put(`${this.#basePath}/update-info`, payload);
    return response.data;
  }

  async changePassword(payload) {
    const response = await api.post(`${this.#basePath}/change-password`, payload);
    return response.data;
  }
}

const authService = new AuthService();

export default authService;
export { AuthService };
