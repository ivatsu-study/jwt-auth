import axios from "axios";

export default class Api {
  constructor(options = {}) {
    this.client = options.client || axios.create();
    this.token = options.token;
    this.refreshToken = options.refreshToken;

    this.client.interceptors.request.use(
      (config) => {
        if (!this.token) {
          return config;
        }
        const newConfig = {
          headers: {},
          ...config,
        };
        newConfig.headers.Authorization = `Bearer ${this.token}`;
        return newConfig;
      },
      (e) => Promise.reject(e),
    );
  }

  async login({ login, password }) {
    const { data } = await this.client.post("/auth/login", { login, password });
    this.token = data.token;
    this.refreshToken = data.refreshToken;
  }

  logout() {
    this.token = null;
    this.refreshToken = null;
  }

  getUsers() {
    return this.client("/users").then(({ data }) => data);
  }
}
