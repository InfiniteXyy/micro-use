/**
 * @jest-environment node
 */
const micro = require("micro");
const testListen = require("test-listen");
const axios = require("axios");
const yup = require("yup");
const {
  hooked,
  sendReject,
  useContext,
  useBody,
  useHeaders,
} = require("./index");
const { send } = micro;
let server = null;

function listen(_server) {
  server = _server;
  return testListen(_server);
}
afterEach(() => {
  if (server) server.close();
});

it("should handle request", async function () {
  const handler = () => {
    return "hello";
  };
  const url = await listen(micro(hooked(handler)));
  const { data } = await axios.get(url);
  expect(data).toEqual("hello");
});

it("should context hook work", async function () {
  const handler = () => {
    const { req, res } = useContext();
    send(res, 200, { path: req.url });
  };
  const url = await listen(micro(hooked(handler)));
  const response = await axios.get(`${url}/Jack`);
  expect(response.status).toEqual(200);
  expect(response.data).toEqual({ path: "/Jack" });
});

it("should context hook work under multiple request", async function () {
  const handler = () => {
    const { req, res } = useContext();
    send(res, 200, { path: req.url });
  };
  const url = await listen(micro(hooked(handler)));
  const response = await axios.get(`${url}/Jack`);
  const response2 = await axios.get(`${url}/Tom`);
  expect(response.data).toEqual({ path: "/Jack" });
  expect(response2.data).toEqual({ path: "/Tom" });
});

it("should useBody work", async function () {
  const loginSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required(),
  });
  const handler = async () => {
    const { email, password } = await useBody((body, sendReject) => {
      return loginSchema
        .validate(body)
        .catch((e) => sendReject(200, { errors: e.errors }));
    });
    return { email };
  };
  const url = await listen(micro(hooked(handler)));
  const response = await axios.post(url, {
    email: "Jack@gmail.com",
    password: "321",
  });
  const response2 = await axios.post(url, {
    email: "Jack",
    password: "321",
  });
  expect(response.data).toEqual({ email: "Jack@gmail.com" });
  expect(response2.data.errors).toHaveLength(1);
});

it("should use header work", async function () {
  const handler = () => {
    const headers = useHeaders();
    return {
      token: headers.token,
    };
  };
  const url = await listen(micro(hooked(handler)));
  const response = await axios.get(url, {
    headers: {
      token: "123",
    },
  });
  expect(response.data).toEqual({ token: "123" });
});

it("should custom hook work", async function () {
  const useAuth = async () => {
    const { res } = useContext();
    const headers = useHeaders();
    if (headers.token !== "token") {
      await sendReject(res, 401, "unauthorized");
    }
    return { name: "xyy" };
  };
  const handler = async () => {
    const user = await useAuth();
    return { user };
  };
  const url = await listen(micro(hooked(handler)));
  const response = await axios.get(url, {
    headers: {
      token: "token",
    },
  });
  expect(response.data).toEqual({ user: { name: "xyy" } });
  await axios
    .get(url)
    .catch((e) => expect(e.response.data).toEqual("unauthorized"));
});
