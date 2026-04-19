import { expect } from "@std/expect";
import app from "./main.ts";

function testFeed(name: string, path: string) {
  return Deno.test(name, async () => {
    const res = await app.request(path);
    expect(res.headers.get("content-type")).toContain("application/atom+xml");
    expect(await res.text()).toContain(
      '<feed xmlns="http://www.w3.org/2005/Atom">',
    );
  });
}

Deno.test("Root", async () => {
  const res = await app.request("/");
  expect(await res.text()).toContain("Hello Relic!");
});
