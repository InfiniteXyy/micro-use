# `@infinitex/micro-use`

Another simple [Micro](https://github.com/zeit/micro) plugin, to make it run with composition API.

### Example

```js
import micro from "micro";
import { hooked, useBody } from "@infinitex/micro-use";

const handler = () => {
  const { name } = useBody();
  return "hello " + name;
}

micro(hooked(handler)).listen(3000);
```

There is no middleware, you can create your own hook to do the stuff such as permission verification.

```js
import micro from "micro";
import { hooked, sendReject, useContext, useHeader } from "@infinitex/micro-use";

const useAuth = async () => {
	const { res } = useContext();  
  const headers = useHeaders();
  const user = await verify(headers.token);
  if (!user) {
    sendError(res, 403, "unauthorized");
  }
  return user;
}

const handler = async () => {
  const user = await useAuth();
  // do anything with user
  return ...
}

micro(hooked(handler)).listen(3000);
```

### Install

```bash
yarn add @infinitex/micro-use
```

### Note

I use global variables to keep the request parameters. To avoid conflicts, the useContext function should be placed at the beginning of the synchronization function.

```js
const handler = async () => {
  const project = await useProject();
  DB.findAll()
  const user = await useAuth(); // Wrong! may lead to strange problems
}

const handler = async () => {
  const project = await useProject();
  const user = await useAuth(); // Correct! useContext should beyond all async functions
  DB.findAll()
}
```

### Principle

The library is very lightweight and offers only a few functional approaches, so it can work well with other micro libraries.


