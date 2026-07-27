export default {
  async fetch(request, env) {
    if (env?.ASSETS?.fetch) {
      return env.ASSETS.fetch(request);
    }

    return new Response("足球百态暂时无法读取静态资源。", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
};
