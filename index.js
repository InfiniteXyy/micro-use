const { json, send } = require("micro");
let context;
const HANDLER_REJECT_SIGNAL = "HANDLER_REJECT_SIGNAL";
function hooked(handler) {
  return async (req, res) => {
    context = { req, res };
    try {
      return await handler(req, res);
    } catch (e) {
      if (e !== HANDLER_REJECT_SIGNAL) throw e;
    }
  };
}

async function sendReject(res, code, data) {
  await send(res, code, data);
  throw HANDLER_REJECT_SIGNAL;
}

function useContext() {
  return context;
}

async function useBody(validator) {
  const { req, res } = useContext();
  const body = await json(req);
  validator &&
    (await validator(body, (code, data) => sendReject(res, code, data)));
  return body;
}

function useHeaders() {
  const { req } = useContext();
  return req.headers;
}

module.exports.hooked = hooked;
module.exports.useContext = useContext;
module.exports.useBody = useBody;
module.exports.useHeaders = useHeaders;
module.exports.sendReject = sendReject;
