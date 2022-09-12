import test from "ava";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import Api from "../src";

test("Login captures token information", async (t) => {
  const client = axios.create();
  const mock = new MockAdapter(client);
  const api = new Api({ client });

  const LOGIN_REQUEST = {
    login: "login",
    password: "password",
  };
  const LOGIN_RESPONSE = {
    token: "TOKEN",
    refreshToken: "REFRESH_TOKEN",
  };

  mock.onPost("/auth/login", LOGIN_REQUEST).reply(200, LOGIN_RESPONSE);
  mock.onGet("/users").reply(200, []);
  await api.login(LOGIN_REQUEST);
  await api.getUsers();

  t.is(mock.history.get.length, 1);
  t.is(
    mock.history.get[0].headers.Authorization,
    `Bearer ${LOGIN_RESPONSE.token}`,
  );
});
