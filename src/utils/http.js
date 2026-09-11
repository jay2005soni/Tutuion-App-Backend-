function ok(res, message, data = {}) {
  return res.status(200).json({ success: true, message, data });
}

function created(res, message, data = {}) {
  return res.status(201).json({ success: true, message, data });
}

function fail(status, message, errorCode = "ERROR") {
  const error = new Error(message);
  error.status = status;
  error.errorCode = errorCode;
  return error;
}

module.exports = { ok, created, fail };
