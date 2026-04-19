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

testFeed(
  "MSN - AFP",
  "/msn/en-us/vid-3kv7h73mtcdhywg28d4f9ihgi4xcniq2ubb83iikdu3qwmbd73pa",
);
testFeed(
  "MSN - Reuters",
  "/msn/en-us/vid-mpxsw8rp392wedf25t8tfhk7r3b364q8dj75ks43nimmf06qg2es",
);
testFeed(
  "MSN - The Associated Press",
  "/msn/en-us/vid-b5wrcq2rxin3r63c989gsixnar8rq6k82y8babncp60xqtjibrgs",
);
