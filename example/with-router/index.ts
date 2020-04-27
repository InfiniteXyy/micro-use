import { router, get } from "microrouter";
import micro from "micro";
import { hooked, sendReject, useContext } from "@infinitex/micro-use";

interface User {
  id: string;
  name: string;
  locale: string;
}
const DB: User[] = [
  { id: "0", name: "小红", locale: "chinese" },
  { id: "1", name: "Jack", locale: "english" },
];

const useUser = async () => {
  const { req, res } = useContext();
  const { id } = req.params;
  const user = DB.find((i) => i.id === id);
  if (!user) {
    await sendReject(res, 404, "user id not found");
  }
  return user;
};

const hello = async () => {
  const user = await useUser();
  if (user.locale === "chinese") return { msg: "你好！" + user.name };
  else return { msg: "Hello! " + user.name };
};

const bye = () => {
  return "bye";
};

const server = micro(hooked(router(get("/bye", bye), get("/:id", hello))));

server.listen(3000);
