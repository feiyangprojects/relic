export const meta = {
    generator: "Relic"
}

export class ResponseError extends Error {
  response: Response;
  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}
export async function fetchX(
  input: string | URL | Request,
  init?: RequestInit,
) {
  const res = await fetch(input, init);
  if (res.ok !== true) {
    throw new ResponseError(`Response not OK (${res.status} ${res.statusText})`, res);
  }
  return res;
}
