export function setCors(response) {
  response.setHeader("access-control-allow-origin", process.env.CORS_ORIGIN || "*");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type,authorization,x-api-key");
}

export function handleOptions(request, response) {
  setCors(response);
  if (request.method === "OPTIONS") {
    response.status(200).end();
    return true;
  }
  return false;
}
