import { readSetting } from "$sb/lib/settings_page.ts";
import { readSecret } from "$sb/lib/secrets_page.ts";
import { editor, markdown, space, system } from "$sb/silverbullet-syscall/mod.ts";
import { renderToText } from "$sb/lib/tree.ts";
import { cleanMarkdown } from "$sb-plugs/markdown/util.ts";
import { GhostAdmin } from "./ghost_api.ts";
import type { PublishEvent } from "$sb/app_event.ts";
import { filterBox } from "$sb/silverbullet-syscall/editor.ts";
import {
  extractFrontmatter,
  prepareFrontmatterDispatch,
} from "$sb/lib/frontmatter.ts";
import { ParseTree } from "$sb/lib/tree.ts";

type GhostInstanceConfig = {
  url: string;
  adminKey: string;
};

type GhostConfig = Record<string, GhostInstanceConfig>;

export type HtmlPost = {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  status: "draft" | "published";
  visibility: string;
  created_at: string;
  published_at: string;
  updated_at: string;
  tags: Tag[];
  primary_tag: Tag;
  url: string;
  excerpt: string;
};

export type Post = {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  lexical: string;
  status: "draft" | "published";
  visibility: string;
  created_at: string;
  published_at: string;
  updated_at: string;
  tags: Tag[];
  primary_tag: Tag;
  url: string;
  excerpt: string;
};

type Tag = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type MobileDoc = {
  version: string;
  atoms: any[];
  cards: Card[];
};

type Card = any[];

async function markdownToHtml(text: string): Promise<Partial<string>> {
  /* https://forum.ghost.org/t/struggling-to-update-post-using-admin-api-lexical/45209/13 */
  /* https://github.com/silverbulletmd/silverbullet/blob/e280dfee4a2c6fd3611ade2a372a7624abae0c0b/plugs/share/share.ts#L112 */
  let html = await system.invokeFunction(
    "markdown.markdownToHtml",
    text
  );

  // html = "<p>this is just a plain old paragraph to test things.</p>";

  // html = "<!--kg-card-begin: html-->" + html + "<!--kg-card-end: html-->";

  return html;
}

const postRegex = /#\s*([^\n]+)\n(([^\n]|\n)+)$/;

function htmlToHtmlCard(htmlString: string): object {
  const lexical = {
      root: {
          children: [
              {
                  type: 'html',
                  version: 1,
                  html: htmlString
              }
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1
      }
  };

  return lexical;
};

async function markdownToPost(text: string): Promise<Partial<Post>> {
  const match = postRegex.exec(text);
  if (match) {
    const [, title, content] = match;
    const htmlString = await markdownToHtml(content);
    return {
      title,
      lexical: JSON.stringify(htmlToHtmlCard(htmlString)),
    };
  }
  throw Error("Post should start with a # header");
}

async function getConfig(): Promise<GhostConfig> {
  const config = await readSetting("ghost") as GhostConfig;
  const secret = await readSecret("ghost") as Record<string, string>; // instance to admin key
  // Slot in secrets with the configs
  for (const [name, def] of Object.entries(config)) {
    def.adminKey = secret[name];
  }
  return config;
}

export async function publish(event: PublishEvent): Promise<boolean> {
  const config = await getConfig();
  console.log(event);
  const [, name, type, slug] = event.uri!.split(":");
  console.log(`name: ${name}`);
  console.log(`type: ${type}`);
  console.log(`type: ${slug}`);
  const instanceConfig = config[name];
  if (!instanceConfig) {
    throw new Error("No config for instance " + name);
  }
  const admin = new GhostAdmin(instanceConfig.url, instanceConfig.adminKey);
  await admin.init();
  const text = await space.readPage(event.name);
  const post = await markdownToPost(text);
  post.slug = slug;
  if (type === "post") {
    await admin.publishPost(post);
  } else if (type === "page") {
    await admin.publishPage(post);
  }
  return true;
}

async function selectInstance(): Promise<string | undefined> {
  const config = await getConfig();
  const choices = Object.keys(config);
  const choice = await filterBox(
    "Select Ghost instance",
    choices.map((c) => ({ name: c })),
  );
  if (!choice) {
    return;
  }
  return choice.name;
}

async function selectPublishType(): Promise<"post" | "page" | undefined> {
  const choice = await filterBox("Select publish type", [
    { name: "post" },
    { name: "page" },
  ]);
  if (!choice) {
    return;
  }
  return choice.name as "post" | "page";
}

export async function publishPage() {
  const currentPage = await editor.getCurrentPage();
  const text = await editor.getText();
  const tree = await markdown.parseMarkdown(text);

  const { $share } = await extractFrontmatter(tree);

  if ($share && Array.isArray($share)) {
    for (const share of $share) {
      if (share.startsWith("ghost:")) {
        // We got a ghost share, let's publish it and we're done
        await publish({
          name: currentPage,
          uri: share,
        });
        return editor.flashNotification("Published to Ghost!");
      }
    }
  }

  // If we're here, this page has not been shared to Ghost yet

  // Let's select an instance
  const instanceName = await selectInstance();
  if (!instanceName) {
    return;
  }

  // And a type (post or page)
  const type = await selectPublishType();
  if (!type) {
    return;
  }
  const config = await getConfig();
  const instanceConfig = config[instanceName];
  if (!instanceConfig) {
    throw new Error("No config for instance " + instanceName);
  }

  // And a post/page slug
  const slug = await editor.prompt("Post slug");
  if (!slug) {
    return;
  }
  const post = await markdownToPost(text);
  post.slug = slug;

  // Publish to Ghost
  const admin = new GhostAdmin(instanceConfig.url, instanceConfig.adminKey);
  await admin.init();
  await admin.publishPost(post);

  // Update frontmatter
  await editor.dispatch(
    await prepareFrontmatterDispatch(tree, {
      $share: [`ghost:${instanceName}:${type}:${slug}`],
    }),
  );

  await editor.flashNotification("Published to Ghost!");
}

export async function uploadImagesAndReplaceLinks(
  tree: ParseTree,
  instanceConfig: GhostInstanceConfig,
) {
  const admin = new GhostAdmin(instanceConfig.url, instanceConfig.adminKey);
  await admin.init();
  const image = await space.readAttachment("zefplus/posts/test.png");
  console.log("Got image", image.byteLength);
  console.log(await admin.uploadImage("test.png", image));
}
