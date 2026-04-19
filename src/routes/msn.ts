import { Atom } from "feed";
import { createMiddleware } from "hono/factory";
import { fetchX, meta } from "../utils.ts";

const apikey = "0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM";
const imgRegexp = /data-document-id="cms\/api\/amp\/image\/([^"]+)"/g;
const imgRegexpReplacement =
  'src="https://img-s-msn-com.akamaized.net/tenant/amp/entityid/$1.img"';

export const msnPath = "/msn/:market/:id";
export const msn = createMiddleware<Record<PropertyKey, never>, typeof msnPath>(
  async (c) => {
    const market = c.req.param("market");
    const id = c.req.param("id");

    let info;
    try {
      info = await (await fetchX(
        `https://assets.msn.com/service/community/users/${id}?version=1.1&profile=social&verify=false&apikey=${apikey}&ocid=social-peregrine&cm=en-us&it=web&wrapodata=false&market=${market}`,
      )).json();
    } catch (e) {
      throw new Error("Can't find publisher with specified market and id pair");
    }

    const feed = new Atom({
      ...meta,
      title: `MSN - ${info.primaryName}`,
      description: info.rating?.topline?.trim() || "",
      link: c.req.url,
      authors: [{ name: info.primaryName }],
      language: market,
    });

    // This endpoint will always return something even if the market and id pair is invalid
    const index = await (await fetchX(
      `https://assets.msn.com/service/news/feed/pages/fullchannelpage?ProviderId=${id}&apikey=${apikey}&cm=${market}&it=web&memory=32&scn=ANON&timeOut=2000`,
    )).json();

    await Promise.all(
      index.sections.find((t: { template: string }) =>
        t.template === "fullchanneltop"
      ).cards.find((c: { id: string }) => c.id === "ProviderFeeds").subCards
        .map(async (
          s: { id: string },
        ) => {
          const article = await (await fetchX(
            `https://assets.msn.com/content/view/v2/Detail/${market}/${s.id}`,
          )).json();

          const item = {
            title: article.title,
            link: article.sourceHref,
            id: article.sourceHref,
            summary: article.abstract.trim(),
            updated: new Date(article.updatedDateTime),
          };
          switch (article.type) {
            case "article":
              feed.addItem({
                ...item,
                content: {
                  body: article.body.replace(
                    imgRegexp,
                    imgRegexpReplacement,
                  ),
                  type: "html",
                },
              });
              break;
            case "video":
              feed.addItem({
                ...item,
                content: {
                  body: `<video controls src="${
                    article.videoMetadata.externalVideoFiles[0].url
                  }"></video>`,
                  type: "html",
                },
              });
              break;
            default:
              // TODO: Figure out if there are other article types
              break;
          }
        }),
    );

    return c.render(feed);
  },
);
