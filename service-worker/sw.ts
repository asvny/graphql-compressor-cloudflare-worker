declare var self: ServiceWorkerGlobalScope;
export {};

import * as graphqlDeduplicator from "graphql-deduplicator";

const { inflate } = graphqlDeduplicator;

const VERSION = 1;

self.addEventListener("install", async event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", async event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", async event => {
  event.respondWith(handleRequest(event.request, event));
});

async function handleRequest(request: Request, event: FetchEvent): Promise<any> {
  const requestURL = new URL(request.url);

  const isPOSTMethod = isPOST(request);
  const isGraphQLEndpoint = isGraphQL(requestURL);
  const shouldInflateResponse = shouldInflate(requestURL);
  const inDebug = isDebug(requestURL);

  try {
    if (isPOSTMethod && isGraphQLEndpoint) {
      let payload = await event.request.json();
      // @ts-ignore
      let graphqlRequest = new Request(requestURL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "content-type": "application/json"
        }
      });

      let response = await fetch(graphqlRequest);
      let responseJSON = await response.json();

      if (shouldInflateResponse && !inDebug) {
        responseJSON = inflate(responseJSON);
      }

      return new Response(JSON.stringify(responseJSON), { status: 200 });
    }
  } catch (err) {
    console.error(err);
  }

  return fetch(event.request);
}

function isPOST(request: Request) {
  return request.method === "POST";
}

function isGraphQL(url: URL) {
  return url.pathname === "/graphql";
}

function shouldInflate(url: URL) {
  return url.searchParams.has("deflate");
}

function isDebug(url: URL) {
  return url.searchParams.has("debug");
}
