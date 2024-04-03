import "$sb/lib/fetch.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
import type { HtmlPost, Post } from "./ghost.ts";

import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

export type Image = {
  ref: string;
  url: string;
};

const fromHexString = (hexString: string) =>
  Uint8Array.from(
    hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
export class GhostAdmin {
  private token?: string;

  constructor(private url: string, private key: string) {}

  async init() {
    const [id, secret] = this.key.split(":");

    const key = await crypto.subtle.importKey(
      "raw",
      fromHexString(
        secret,
      ),
      { name: "HMAC", hash: "SHA-256" },
      true,
      ["sign", "verify"],
    );

    this.token = await create({
      alg: "HS256",
      kid: id,
      typ: "JWT",
    }, {
      exp: getNumericDate(5 * 60),
      iat: getNumericDate(0),
      aud: "/v3/admin/",
    }, key);
  }

  async listPosts(): Promise<Post[]> {
    const result = await fetch(
      `${this.url}/ghost/api/v3/admin/posts?include=lexical&order=published_at+DESC`,
      {
        headers: {
          Authorization: `Ghost ${this.token}`,
        },
      },
    );

    return (await result.json()).posts;
  }

  async uploadImage(filename: string, data: Uint8Array): Promise<any> {
    const contentType = mime.getType(filename);
    const blob = new Blob([data], { type: contentType });

    // Create FormData and append the Blob
    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("ref", filename);

    // Use fetch to send the request
    const result = await nativeFetch(
      `${this.url}/ghost/api/v3/admin/images/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Ghost ${this.token}`,
        },
      },
    );

    return result.json();
  }

  publishPost(post: Partial<HtmlPost>): Promise<any> {
    return this.publish("posts", post);
  }

  publishPage(post: Partial<HtmlPost>): Promise<any> {
    return this.publish("pages", post);
  }

  async publish(publishType: "pages" | "posts", post: Partial<Post>): Promise<any> {
    const requestBody = {
      [publishType]: [post],
    };
    // console.log(requestBody);

    const oldPostQueryR = await fetch(
      `${this.url}/ghost/api/v3/admin/${publishType}/slug/${post.slug}`,
      {
        headers: {
          Authorization: `Ghost ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    );
    const oldPostQuery = await oldPostQueryR.json();
    if (!oldPostQuery[publishType]) {
      // New!
      if (!post.status) {
        post.status = "draft";
      }

      const result = await fetch(`${this.url}/ghost/api/v3/admin/${publishType}/`, {
        method: "POST",
        headers: {
          Authorization: `Ghost ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      const jsonResponse = await result.json();
      console.log(jsonResponse);
      return jsonResponse[publishType][0];
    } else {
      const oldPost: Post = oldPostQuery[publishType][0];
      post.updated_at = oldPost.updated_at;

      const result = await fetch(
        `${this.url}/ghost/api/v3/admin/${publishType}/${oldPost.id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Ghost ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody)
        },
      );

      const jsonResponse = await result.json();
      // console.log(jsonResponse);
      return jsonResponse[publishType][0];
    }
  }
}
