import { Atom } from "feed";
import { Hono } from "hono";

type AtomType = InstanceType<typeof Atom>;

declare module "hono" {
  interface ContextRenderer {
    (
      content: AtomType,
    ): Response;
  }
}

const app = new Hono();

app.onError((err, c) => c.text(err.message, 500));

app.use(async (c, next) => {
  c.setRenderer((content) => {
    return new Response(content.build(), {
      headers: {
        "content-type": "application/atom+xml; charset=utf-8",
      },
    });
  });
  await next();
});

app.get("/", (c) => {
  return c.text("Hello Relic!");
});

export default app;
