import {} from "@cloudflare/workers-types";
import * as graphqlDeduplicator from "graphql-deduplicator";

const { deflate } = graphqlDeduplicator;

addEventListener("fetch", (event: FetchEvent) => {
  event.passThroughOnException();
  try {
    event.respondWith(handleRequest(event.request, event));
  } catch (err) {
    return new Response("Error Occurred", { status: 500 });
  }
});

const ENDPOINT = "https://graphql-compressor.asvny.now.sh/";
const GRAPHQL_ENDPOINT = ENDPOINT + "graphql";

async function handleRequest(request: Request, event: FetchEvent) {
  let url = new URL(request.url);

  let checkPOST = isPOST(request);
  let isGraphQLEndpoint = isGraphQL(url);
  let shouldDeflateResponse = shouldDeflate(url);

  try {
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    } else if (isPOST && checkPOST && isGraphQLEndpoint) {
      let payload = await request.json();

      let graphqlRequest = new Request(GRAPHQL_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json"
        }
      });
      let response = await fetch(graphqlRequest);

      if (shouldDeflateResponse) {
        let clonedResponse = await response.clone();
        let body = await clonedResponse.json();

        let deflatedResponse = deflate(body);

        response = new Response(JSON.stringify(deflatedResponse, null, 2), { ...clonedResponse });
      }

      return response;
    }

    return new Response(JSON.stringify({}), { status: 200 });
  } catch (err) {
    throw err;
  }
}

function handleOptions(request: Request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } else {
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS"
      }
    });
  }
}

function isPOST(request: Request): boolean {
  return request.method === "POST";
}

function isGraphQL(url: URL): boolean {
  return url.pathname === "/graphql";
}

function shouldDeflate(url: URL): boolean {
  return url.searchParams.has("deflate");
}
