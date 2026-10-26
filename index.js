var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var compose = /* @__PURE__ */ __name2((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
    __name2(dispatch, "dispatch");
  };
}, "compose");
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();
var bufferToFormData = /* @__PURE__ */ __name2((arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
}, "bufferToFormData");
var MAX_NESTING_DEPTH = 32;
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = /* @__PURE__ */ __name2((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name2(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
__name2(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value, nestingState);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
__name2(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name2((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name2((form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".", MAX_NESTING_DEPTH + 2);
  if (keys.length > MAX_NESTING_DEPTH + 1) {
    throwNestingLimitExceeded();
  }
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) {
          throwNestingLimitExceeded();
        }
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");
var throwNestingLimitExceeded = /* @__PURE__ */ __name2(() => {
  throw new Error("Nesting limit exceeded");
}, "throwNestingLimitExceeded");
var splitPath = /* @__PURE__ */ __name2((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name2((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name2((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name2((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name2((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name2((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name2((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name2((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name2((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name2((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name2((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var tryDecodeURIComponent = /* @__PURE__ */ __name2((str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str, "tryDecodeURIComponent");
var _decodeURI = /* @__PURE__ */ __name2((value) => {
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return tryDecodeURIComponent(value);
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name2((url, key, multiple) => {
  const hashIndex = url.indexOf("#", 8);
  if (hashIndex !== -1) {
    url = url.slice(0, hashIndex);
  }
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name2((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  static {
    __name2(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = tryDecodeURIComponent(value);
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name2((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    for (const anyCachedKey in bodyCache) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        const contentType = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
        return new Response(body, {
          headers: contentType ? { "Content-Type": contentType } : void 0
        })[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    ;
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name2((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name2(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name2((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name2((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  static {
    __name2(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name2((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name2((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name2(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name2((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   // Append multiple headers using the append option (e.g. Vary)
   *   c.header('Vary', 'Accept-Encoding', { append: true })
   *   c.header('Vary', 'User-Agent', { append: true })
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name2((name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name2((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name2((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name2((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) {
        if (key === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      if (!responseHeaders) {
        let count = 0;
        for (const k in headers) {
          if (++count > 1 || typeof headers[k] !== "string") {
            responseHeaders = new Headers();
            break;
          }
        }
      }
      if (responseHeaders) {
        for (const k in headers) {
          const v = headers[k];
          if (typeof v === "string") {
            responseHeaders.set(k, v);
          } else {
            responseHeaders.delete(k);
            for (const v2 of v) {
              responseHeaders.append(k, v2);
            }
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = /* @__PURE__ */ __name2((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name2((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name2((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name2((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name2((html, arg, headers) => {
    const res = /* @__PURE__ */ __name2((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name2((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibytes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name2(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
  static {
    __name2(this, "UnsupportedPathError");
  }
};
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
var notFoundHandler = /* @__PURE__ */ __name2((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name2((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  static {
    __name2(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(methodName, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) {
            this.#addRoute(methodName, this.#path, handler);
          }
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name2(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name2((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name2((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name2((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name2(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} env - env Object
   * @param {ExecutionContext} executionCtx - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name2((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name2((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name2(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};
var createNullObject = /* @__PURE__ */ __name2(() => /* @__PURE__ */ Object.create(null), "createNullObject");
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name2(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");
__name2(match, "match");
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return b === TAIL_WILDCARD_REG_EXP_STR ? -1 : 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
__name2(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  static {
    __name2(this, "_Node");
  }
  // handler index of a dynamic path, or -1 for a static path terminal
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : null : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          if (regexpStr === ".*") {
            throw PATH_ERROR;
          }
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ONLY_WILDCARD_REG_EXP_STR && regexpStr !== TAIL_WILDCARD_REG_EXP_STR) {
            for (const k in node.#children) {
              if (
                // a single-char pattern coexists with single-char literals as a literal does
                (regexpStr.length > 1 || k.length > 1) && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
              ) {
                throw PATH_ERROR;
              }
            }
          }
          nextNode = node.#children[regexpStr] = new _Node();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) {
            if (k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR) {
              throw PATH_ERROR;
            }
          }
          nextNode = node.#children[token] = new _Node();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) {
      throw PATH_ERROR;
    }
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};
var Trie = class {
  static {
    __name(this, "Trie");
  }
  static {
    __name2(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  // dynamic path -> [handler index, param assoc]; static paths are not registered
  paths = createNullObject();
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};
var wildcardRegExpCache = createNullObject();
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    `^${path.replace(
      /\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,
      (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ONLY_WILDCARD_REG_EXP_STR : `/:${LABEL_REG_EXP_STR}`
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
__name2(buildWildcardRegExp, "buildWildcardRegExp");
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
__name2(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  static {
    __name2(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: createNullObject() };
    this.#routes = { [METHOD_NAME_ALL]: createNullObject() };
    this.#tries = { [METHOD_NAME_ALL]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = createNullObject();
        for (const p in handlerMap[METHOD_NAME_ALL]) {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          this.#insertPath(method, p);
        }
      }
    }
    if (path === "/*") {
      path = "*";
    }
    const methods = method === METHOD_NAME_ALL ? Object.keys(middleware) : [method];
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      for (const m of methods) {
        if (!middleware[m][path]) {
          this.#insertPath(m, path);
          middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
      }
      for (const handlerMap of [middleware, routes]) {
        for (const m of methods) {
          for (const p in handlerMap[m]) {
            re.test(p) && handlerMap[m][p].push([handler, path]);
          }
        }
      }
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths) {
      for (const m of methods) {
        if (!routes[m][path2]) {
          this.#insertPath(m, path2);
          routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || [];
        }
        routes[m][path2].push([handler, path2]);
      }
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#routes)) {
      matchers[method] = this.#buildMatcher(method);
    }
    this.#middleware = this.#routes = this.#tries = void 0;
    wildcardRegExpCache = createNullObject();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) {
      for (const path in r) {
        const handlers = r[path];
        const pathData = trie.paths[path];
        if (!pathData) {
          staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
          continue;
        }
        handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [
          h,
          trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
            map[key] = paramReplacementMap[pathData[1][i][1]];
            return map;
          }, createNullObject())
        ]);
      }
    }
    return [regexp, indexReplacementMap.map((i) => handlerData[i]), staticMap];
  }
};
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  static {
    __name2(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};
var emptyParams = createNullObject();
var order = 0;
var Node2 = class _Node2 {
  static {
    __name(this, "_Node2");
  }
  static {
    __name2(this, "_Node");
  }
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new _Node2();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) {
        possibleKeys.add(pattern[1]);
      }
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: [...possibleKeys],
        score: ++order
      }
    });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) {
            continue;
          }
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  static {
    __name2(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node = new Node2();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path]) {
      this.#node.insert(method, result, handler);
    }
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono2");
  }
  static {
    __name2(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};
var app = new Hono2();
var disclosure = "ESBE Incorporated is a 501(c)(3) nonprofit organization, EIN 87-1218291. AIVA Claims is a charitable program of ESBE Incorporated. ESBE Tech is a separate for-profit technology company. ESBE Incorporated is not affiliated with or endorsed by the U.S. Department of Veterans Affairs.";
var determinationLetter = "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf";
app.use("*", async (c, next) => {
  const requestUrl = new URL(c.req.url);
  if (requestUrl.hostname === "www.esbeincorporated.org") {
    return c.redirect(
      `https://esbeincorporated.org${requestUrl.pathname}${requestUrl.search}`,
      301
    );
  }
  await next();
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; connect-src 'self' https://cloudflareinsights.com https://www.google-analytics.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; img-src 'self' data: https://www.google-analytics.com; object-src 'none'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; upgrade-insecure-requests",
    { append: true }
  );
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Cross-Origin-Opener-Policy", "same-origin");
  c.header("Cross-Origin-Resource-Policy", "same-origin");
});
/* === AI-READABLE BEGIN (generated from ai-readable.js by patch_ai_readable.py) === */
// ai-readable.js — AI-readable layer for esbeincorporated.org (ScrollLaunch §§1–8).
// Single source of truth: SITE + PAGES below are transcribed verbatim from the
// live page templates in index.js (routes /, /donate, /community). No invented
// facts. This file is inlined into index.js by patch_ai_readable.py between
// AI-READABLE markers; it is also importable standalone for tests.
// Keep robots.txt, llms.txt and ai.txt in sync — all three are generated here.

const DETERMINATION_LETTER =
  typeof determinationLetter !== "undefined"
    ? determinationLetter
    : "https://apps.irs.gov/pub/epostcard/dl/FinalLetter_87-1218291_ESBEINCORPORATED_05012026_v1.0.pdf";
const DISCLOSURE =
  typeof disclosure !== "undefined"
    ? disclosure
    : "ESBE Incorporated is a 501(c)(3) nonprofit organization, EIN 87-1218291. AIVA Claims is a charitable program of ESBE Incorporated. ESBE Tech is a separate for-profit technology company. ESBE Incorporated is not affiliated with or endorsed by the U.S. Department of Veterans Affairs.";

const SITE = {
  name: "ESBE Incorporated",
  url: "https://esbeincorporated.org",
  description:
    "ESBE Incorporated is a 501(c)(3) nonprofit advancing veteran support and public-interest access to government-facing services.",
  email: "help@esbeincorporated.org",
  phone: "(802) 715-3723",
  taxId: "87-1218291",
  determinationLetter: DETERMINATION_LETTER,
  disclosure: DISCLOSURE,
};

const L = (text, url) => ({ text, url });

// Content model: sections are {heading, paragraphs[], bullets[], facts[[k,v]]}
const PAGES = [
  {
    path: "/",
    mdPath: "/index.md",
    title: "ESBE Incorporated | Veteran support and public-interest work",
    h1: "Public-interest work that helps people move forward",
    description: SITE.description,
    aiSummary:
      "ESBE Incorporated is a 501(c)(3) nonprofit (EIN 87-1218291) advancing veteran support — through its AIVA Claims program, which helps veterans prepare VA disability claims for free — and public-interest access to government-facing services.",
    lastUpdated: "2026-09-22",
    sections: [
      {
        heading: "About",
        paragraphs: [
          "ESBE Incorporated builds practical tools and clear information for veterans and people navigating government-facing services.",
          "AIVA Claims is a program of ESBE Incorporated. ESBE Tech provides separate technical infrastructure. ESBE is independent and does not speak for or act on behalf of any government agency.",
        ],
      },
      {
        heading: "Our mission",
        paragraphs: [
          "Public systems should be easier to use when the stakes are high.",
          "We make information easier to understand and help people prepare for the next right step. Our work supports veterans and strengthens public-interest access to government-facing services through clarity, privacy, and accessible technology.",
        ],
      },
      {
        heading: "AIVA Claims (veteran support)",
        paragraphs: [
          "Free, donor-funded help preparing your VA disability claim. You review, edit, and file everything yourself.",
        ],
        bullets: [
          "Create your free account",
          "Upload your records",
          "Review your draft claim package",
          "File it yourself with the VA",
        ],
      },
      {
        heading: "Public-interest services",
        paragraphs: [
          "Accessible technology and plain-language information that help people understand and use government-facing services.",
        ],
      },
      {
        heading: "Selected civic projects",
        paragraphs: [
          "These independent public projects make government-facing information and reporting paths more understandable. They do not represent or act for a government agency.",
        ],
        links: [
          L("Hospital Ledger — a public-good resource for exploring hospital price files published under federal transparency requirements (live)", "https://hospitalledger.com"),
          L("SF Permit Navigator — a plain-language permit-path prototype that identifies where an official city system is required (prototype)", "https://sf-permit-detector.barkleesanders.workers.dev"),
          L("ImproveBayArea — one public reporting form that routes Bay Area requests to the appropriate official 311 service (live)", "https://improvebayarea.com"),
          L("NPS Report — a public tool for reporting maintenance and safety concerns through National Park Service contact paths (live)", "https://nps-report.barkleesanders.workers.dev"),
          L("SF Income Verify — a privacy-first income-verification prototype for San Francisco affordable housing; not affiliated with MOHCD (prototype)", "https://sf-income-verify.barkleesanders.workers.dev/#how-it-works"),
          L("Treasure Island Power — a public outage tracker documenting Treasure Island power failures and related accountability work (live)", "https://www.treasureislandsfpoweroutages.com"),
          L("ESBE Tech — independent infrastructure projects by Barklee Sanders", "https://esbe.tech"),
        ],
      },
      {
        heading: "Transparency",
        facts: [
          ["Organization", "ESBE Incorporated"],
          ["Federal tax ID", "87-1218291"],
          ["Federal status", "501(c)(3) nonprofit organization"],
          ["Public purpose", "Veteran support and public-interest access to government-facing services."],
          ["Program relationship", "AIVA Claims is a program of ESBE Incorporated."],
          ["Government relationship", "Independent nonprofit; not a government agency."],
        ],
        links: [
          L("Read the IRS determination letter", DETERMINATION_LETTER),
          L("Search the IRS Tax Exempt Organization Search", "https://apps.irs.gov/app/eos/"),
          L("Request governance or filing information", "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request"),
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "For public inquiries, governance requests, and nonprofit correspondence, reach us by email or phone.",
          "Email: help@esbeincorporated.org · Phone: (802) 715-3723",
          DISCLOSURE,
        ],
      },
    ],
    related: [
      L("Community — Treasure Island community work", "https://esbeincorporated.org/community"),
      L("Donate to ESBE Incorporated", "https://esbeincorporated.org/donate"),
      L("AIVA Claims — create your free account", "https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&utm_medium=nonprofit_site&utm_campaign=programs_cta"),
    ],
  },
  {
    path: "/donate",
    mdPath: "/donate.md",
    title: "Donate | ESBE Incorporated",
    h1: "Free help for veterans, funded by people who give",
    description:
      "Donate to ESBE Incorporated, a 501(c)(3) nonprofit. Your gift funds free VA claims help for veterans through AIVA Claims.",
    aiSummary:
      "Donate to ESBE Incorporated, a 501(c)(3) nonprofit. Your gift funds free VA claims help for veterans through AIVA Claims.",
    lastUpdated: "2026-10-15",
    sections: [
      {
        heading: "What your gift does",
        paragraphs: [
          "AIVA Claims — ESBE's veteran support program — helps veterans understand and prepare VA disability claims at no cost to them. Donations pay for that work: the tools, the technology, and the time, so veterans never have to.",
          "Giving is processed securely by Every.org. ESBE Incorporated is an independent nonprofit and is not affiliated with the U.S. Department of Veterans Affairs.",
          "AIVA Claims: free, donor-funded help preparing VA disability claims. Veterans review, edit, and file everything themselves — your gift keeps it that way.",
          "No cost to veterans · 501(c)(3) nonprofit, EIN 87-1218291 · CA Charity Registration CT0403243 · Not affiliated with the U.S. Department of Veterans Affairs",
        ],
        links: [
          L("Donate now (Every.org, one-time)", "https://www.every.org/esbe-incorporated?frequency=once#/donate/pay"),
          L("Give monthly (Every.org)", "https://www.every.org/esbe-incorporated?frequency=monthly#/donate/pay"),
        ],
      },
      {
        heading: "Transparency",
        facts: [
          ["Organization", "ESBE Incorporated"],
          ["Federal tax ID", "87-1218291"],
          ["Federal status", "501(c)(3) nonprofit organization"],
          ["CA charity registration", "CT0403243"],
          ["Giving processed by", "Every.org"],
          ["Program relationship", "AIVA Claims is a program of ESBE Incorporated."],
        ],
        links: [
          L("Read the IRS determination letter", DETERMINATION_LETTER),
          L("Search the IRS Tax Exempt Organization Search", "https://apps.irs.gov/app/eos/"),
          L("Ask about sponsorships and grants", "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20sponsorship%20or%20grant%20inquiry"),
        ],
      },
    ],
    related: [L("ESBE Incorporated home", "https://esbeincorporated.org/")],
  },
  {
    path: "/community",
    mdPath: "/community.md",
    title: "Treasure Island Community Work | ESBE Incorporated",
    h1: "Dependable power is a community issue on Treasure Island",
    description:
      "ESBE Incorporated's community work on Treasure Island: public documentation of power outages and plain-language paths to official reporting channels for residents.",
    aiSummary:
      "ESBE Incorporated's community work on Treasure Island: public documentation of power outages and plain-language paths to official reporting channels for residents.",
    lastUpdated: "2026-10-24",
    sections: [
      {
        heading: "About this work",
        paragraphs: [
          "ESBE Incorporated supports public documentation and accountability work for Treasure Island residents. The goal is practical: make outage information easier to find, understand, and act on for the people who live on the island.",
          "ESBE Incorporated is an independent nonprofit. It is not a government agency and does not speak for the City and County of San Francisco, the San Francisco Public Utilities Commission, or the Treasure Island Development Authority.",
        ],
      },
      {
        heading: "Why it matters",
        paragraphs: [
          "An island community feels every outage.",
          "When the power fails, households, small businesses, and neighbors who rely on electricity are affected together. A clear public record of what happened, and a clear path to the right official channel, helps residents ask for reliable service with facts in hand.",
        ],
      },
      {
        heading: "Community resources",
        paragraphs: [
          "Treasure Island Power: a public outage tracker documenting Treasure Island power failures and related accountability work. Its records are community-compiled and are not a live power feed. It is an independent public project and is not affiliated with SFPUC or TIDA.",
          "For an emergency, call 911.",
        ],
        links: [
          L("Treasure Island Power — the public record of outages and related accountability work for Treasure Island", "https://www.treasureislandsfpoweroutages.com"),
          L("Report an outage — through Improve Bay Area or San Francisco 311", "https://www.treasureislandsfpoweroutages.com/report"),
          L("Resident resources — emergency alerts, claim forms, advocacy tools, and press coverage for Treasure Island residents", "https://www.treasureislandsfpoweroutages.com/resources"),
          L("Record requests — public records requests filed in the Treasure Island and Yerba Buena Island grid investigation", "https://www.treasureislandsfpoweroutages.com/records"),
          L("Infrastructure map — an interactive map of Treasure Island grid infrastructure and outage history", "https://www.treasureislandsfpoweroutages.com/map"),
          L("Power quality log — voltage sags, swells, transients, and interruptions recorded by a power-quality meter on Treasure Island", "https://www.treasureislandsfpoweroutages.com/power-quality"),
        ],
      },
      {
        heading: "Transparency",
        facts: [
          ["Organization", "ESBE Incorporated"],
          ["Federal tax ID", "87-1218291"],
          ["Federal status", "501(c)(3) nonprofit organization"],
          ["Government relationship", "Independent nonprofit; not a government agency."],
        ],
        links: [
          L("Read the IRS determination letter", DETERMINATION_LETTER),
          L("Contact us about this work", "mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20community%20inquiry"),
        ],
      },
    ],
    related: [
      L("ESBE Incorporated home", "https://esbeincorporated.org/"),
      L("Support ESBE's work — donate", "https://esbeincorporated.org/donate"),
    ],
  },
];

// Public Worker routes that are intentionally NOT markdown pages, with reasons.
const SKIPS = {
  "/og.png": "image asset generated by the Worker; not a content page",
  "/security.txt": "302 redirect to /.well-known/security.txt (a static asset); not a content page",
};

// ---- format helpers (spec §1) ----
const esc = (s) => String(s).replace(/\|/g, "\\|");
function renderPage(page) {
  const out = [];
  out.push(`# ${page.h1}`, "", `> ${page.description}`, "");
  out.push(`Canonical: ${SITE.url}${page.path === "/" ? "/" : page.path}`, "");
  out.push(`Last updated: ${page.lastUpdated}`, "");
  for (const s of page.sections) {
    out.push(`## ${s.heading}`, "");
    for (const p of s.paragraphs || []) out.push(p, "");
    if (s.bullets?.length) {
      for (const b of s.bullets) out.push(`- ${b}`);
      out.push("");
    }
    if (s.facts?.length) {
      out.push("| | |", "| --- | --- |");
      for (const [k, v] of s.facts) out.push(`| ${esc(k)} | ${esc(v)} |`);
      out.push("");
    }
    if (s.links?.length) {
      for (const l of s.links) out.push(`- [${l.text}](${l.url})`);
      out.push("");
    }
  }
  if (page.related?.length) {
    out.push("## Related", "");
    for (const l of page.related) out.push(`- [${l.text}](${l.url})`);
    out.push("");
  }
  return out.join("\n");
}

// ---- registry (spec §1/§7): one step to add a page = add a PAGES entry ----
const registry = new Map(PAGES.map((p) => [p.path, p]));
function listMarkdownRoutes() {
  return PAGES.map((p) => ({
    path: p.path,
    markdown: p.mdPath,
    api: `/api/md${p.path === "/" ? "/index" : p.path}`,
    title: p.title,
    description: p.description,
    lastUpdated: p.lastUpdated,
    tokens: Math.ceil(renderPage(p).length / 4),
  }));
}

// ---- http helpers (spec §1 headers) ----
const AI_LINK_HEADER =
  `<${SITE.url}/llms.txt>; rel="describedby"; type="text/plain", ` +
  `<${SITE.url}/llms-full.txt>; rel="describedby"; type="text/plain", ` +
  `<${SITE.url}/ai.txt>; rel="describedby"; type="text/plain"`;
const approxTokens = (body) => Math.ceil(body.length / 4);
function markdownResponse(body, { status = 200, canonical = null, lastModified = null } = {}) {
  const headers = {
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Markdown-Tokens": String(approxTokens(body)),
    "X-Robots-Tag": "noindex, follow",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    Vary: "Accept",
    "Access-Control-Allow-Origin": "*",
  };
  if (canonical) {
    headers["Content-Location"] = canonical;
    headers["Link"] = `<${canonical}>; rel="canonical"`;
  }
  if (lastModified) headers["Last-Modified"] = new Date(`${lastModified}T00:00:00Z`).toUTCString();
  return new Response(status === 200 || status === 404 ? body : body, { status, headers });
}
function plainResponse(body, cache = "public, s-maxage=3600, stale-while-revalidate=86400") {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": cache,
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
function markdown404(pathname) {
  const body = `# Not Found\n\n> No page exists at ${pathname} on ${SITE.name}.\n\nCanonical: ${SITE.url}/\n\n## Related\n\n- [ESBE Incorporated home](${SITE.url}/)\n`;
  return markdownResponse(body, { status: 404, canonical: `${SITE.url}/` });
}

// ---- content negotiation (spec §1): q-aware; */* or missing Accept = HTML ----
function wantsMarkdown(accept) {
  if (!accept) return false;
  let qMd = -1, qHtml = -1;
  for (const part of accept.split(",")) {
    const [type, ...params] = part.trim().split(";");
    let q = 1;
    for (const p of params) {
      const [k, v] = p.trim().split("=");
      if (k === "q") q = parseFloat(v);
    }
    const t = type.trim().toLowerCase();
    if (t === "text/markdown") qMd = Math.max(qMd, q);
    if (t === "text/html") qHtml = Math.max(qHtml, q);
    // */* deliberately ignored: it must always yield HTML.
  }
  return qMd >= 0 && qMd > qHtml;
}

// ---- llms.txt (spec §2, llmstxt.org) — keep in sync with robots.txt and ai.txt ----
function buildLlms() {
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description} Its program AIVA Claims helps veterans prepare VA disability claims for free, and its civic projects make government-facing information easier to find and use.`,
    "",
    `Key facts: 501(c)(3) nonprofit organization, EIN ${SITE.taxId}. AIVA Claims is a charitable program of ESBE Incorporated. Contact: ${SITE.email}. ESBE Incorporated is not affiliated with or endorsed by the U.S. Department of Veterans Affairs.`,
    "",
    "<!-- Keep in sync with /robots.txt and /ai.txt. -->",
    "",
    "## Core pages",
    "",
  ];
  for (const p of PAGES)
    lines.push(`- [${p.title}](${SITE.url}${p.mdPath}): ${p.description}`);
  lines.push(
    "",
    "## Machine-readable",
    "",
    `- [Full content](${SITE.url}/llms-full.txt): every page concatenated`,
    `- [Markdown catalog](${SITE.url}/api/md/_catalog)`,
    `- [Sitemap](${SITE.url}/sitemap.xml)`,
    `- [AI usage policy](${SITE.url}/ai.txt)`,
    ""
  );
  return lines.join("\n");
}

// ---- llms-full.txt (spec §3) ----
function buildLlmsFull(now = new Date()) {
  const parts = [
    `# ${SITE.name} - full content`,
    "",
    `> ${SITE.description}`,
    "",
    `Generated: ${now.toISOString().slice(0, 10)}`,
    "",
  ];
  for (const p of PAGES) {
    parts.push("---", "", `<!-- source: ${SITE.url}${p.path === "/" ? "/" : p.path} -->`, "", renderPage(p), "");
  }
  const body = parts.join("\n");
  if (body.length > 500000) console.warn(`llms-full.txt is ${body.length} chars (>500k)`);
  return body;
}

// ---- ai.txt (spec §4) — keep in sync with robots.txt and llms.txt ----
function buildAiTxt(now = new Date()) {
  return [
    "# ai.txt — ESBE Incorporated. Keep in sync with /robots.txt and /llms.txt.",
    "",
    "[identity]",
    `name: ${SITE.name}`,
    `url: ${SITE.url}/`,
    `description: ${SITE.description}`,
    `contact: ${SITE.email}`,
    `legal: 501(c)(3) nonprofit organization, EIN ${SITE.taxId}`,
    "",
    "[permissions]",
    "allowed: summarise, quote with attribution, cite, index for search and answers",
    "",
    "[restrictions]",
    "no fabricated quotes",
    "no fake reviews or ratings",
    "no presenting this content as the model's own work",
    "no training on user-generated private data",
    "",
    "[attribution]",
    `cite as: ${SITE.name} + the canonical HTML URL of the page used`,
    "",
    "[scope]",
    `included: /, /donate, /community, and their .md versions, /llms.txt, /llms-full.txt`,
    "excluded: /api/ (machine endpoints; the markdown catalog at /api/md/_catalog is linked from /llms.txt for direct agent requests)",
    "note: this site has no admin, dashboard or auth pages",
    "",
    "[contact]",
    `email: ${SITE.email}`,
    `Last updated: ${now.toISOString().slice(0, 10)}`,
    "",
  ].join("\n");
}

// ---- robots.txt (spec §5) — keep in sync with llms.txt and ai.txt ----
// Training-crawler posture is intentionally unchanged from the live file:
// no training bots are named and no Content-Signal is added.
function buildRobots() {
  const bots = ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User"];
  const lines = [
    "# robots.txt for esbeincorporated.org",
    "# For AI agents: see /llms.txt and /ai.txt. Keep robots.txt, /llms.txt and /ai.txt in sync.",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
  ];
  for (const b of bots) lines.push(`User-agent: ${b}`, "Allow: /", "");
  lines.push(`Sitemap: ${SITE.url}/sitemap.xml`, "");
  return lines.join("\n");
}

// ---- single handler for every AI-readable path (spec §1) ----
// Returns a Response, or null to fall through to the normal HTML/app handling.
function handleAiReadable(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();
  if (method === "OPTIONS" && (path.endsWith(".md") || path.startsWith("/api/md") || path === "/llms.txt" || path === "/llms-full.txt" || path === "/ai.txt")) {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Accept, Content-Type",
        Vary: "Accept",
      },
    });
  }
  if (method !== "GET" && method !== "HEAD") return null;
  const finish = (res) => {
    if (method !== "HEAD") return res;
    return new Response(null, { status: res.status, headers: res.headers });
  };

  if (path === "/llms.txt") return finish(plainResponse(buildLlms()));
  if (path === "/llms-full.txt")
    return finish(plainResponse(buildLlmsFull(), "public, s-maxage=86400, stale-while-revalidate=604800"));
  if (path === "/ai.txt") return finish(plainResponse(buildAiTxt()));
  if (path === "/robots.txt") return finish(plainResponse(buildRobots()));

  if (path === "/api/md/_catalog") {
    const body = JSON.stringify(
      { site: SITE.name, url: SITE.url, generatedFrom: "renderer registry", routes: listMarkdownRoutes() },
      null,
      2
    );
    return finish(
      new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "Access-Control-Allow-Origin": "*",
        },
      })
    );
  }
  if (path.startsWith("/api/md/")) {
    let sub = path.slice("/api/md".length) || "/";
    if (sub === "/index") sub = "/";
    const page = registry.get(sub);
    if (!page) return finish(markdown404(path));
    return finish(markdownResponse(renderPage(page), { canonical: `${SITE.url}${page.path === "/" ? "/" : page.path}`, lastModified: page.lastUpdated }));
  }
  if (path.endsWith(".md")) {
    let sub = path.slice(0, -3);
    if (sub === "/index" || sub === "") sub = "/";
    const page = registry.get(sub);
    if (!page) return finish(markdown404(path));
    return finish(markdownResponse(renderPage(page), { canonical: `${SITE.url}${page.path === "/" ? "/" : page.path}`, lastModified: page.lastUpdated }));
  }
  // Content negotiation on the allowlist of content routes only.
  const page = registry.get(path);
  if (page && wantsMarkdown(request.headers.get("Accept"))) {
    return finish(markdownResponse(renderPage(page), { canonical: `${SITE.url}${page.path === "/" ? "/" : page.path}`, lastModified: page.lastUpdated }));
  }
  return null;
}
/* === AI-READABLE END === */
app.use("*", async (c, next) => {
  const aiRes = handleAiReadable(c.req.raw);
  if (aiRes) return aiRes;
  await next();
  c.header("Link", AI_LINK_HEADER, { append: true });
});

app.get(
  "/",
  (c) => c.html(`<!doctype html>
<html lang="en">
  <head>
    <!-- Google tag (gtag.js) - GA4 ESBE Incorporated -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-YLVSKGE4LT"><\/script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-YLVSKGE4LT');
    <\/script>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="ESBE Incorporated is a 501(c)(3) nonprofit advancing veteran support and public-interest access to government-facing services." />
    <meta name="theme-color" content="#12352d" />
    <link rel="canonical" href="https://esbeincorporated.org/" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ESBE Incorporated" />
    <meta property="og:title" content="ESBE Incorporated | Public-interest work that helps people move forward" />
    <meta property="og:description" content="A nonprofit advancing veteran support and accessible pathways through government-facing services." />
    <meta property="og:url" content="https://esbeincorporated.org/" />
    <meta property="og:image" content="https://esbeincorporated.org/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="ESBE Incorporated | Public-interest work that helps people move forward" />
    <meta name="twitter:description" content="A nonprofit advancing veteran support and accessible pathways through government-facing services." />
    <meta name="twitter:image" content="https://esbeincorporated.org/og.png" />
    <link rel="stylesheet" href="/styles.css" />
    <title>ESBE Incorporated | Veteran support and public-interest work</title>
    <meta name="ai-summary" content="ESBE Incorporated is a 501(c)(3) nonprofit (EIN 87-1218291) advancing veteran support — through its AIVA Claims program, which helps veterans prepare VA disability claims for free — and public-interest access to government-facing services." />
    <link rel="alternate" type="text/markdown" href="https://esbeincorporated.org/index.md" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"NGO","name":"ESBE Incorporated","url":"https://esbeincorporated.org/","taxID":"87-1218291","email":"help@esbeincorporated.org","contactPoint":[{"@type":"ContactPoint","contactType":"public inquiries and governance requests","email":"help@esbeincorporated.org","url":"https://esbeincorporated.org/#contact"}],"sameAs":["${determinationLetter}"]}<\/script>\n    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"ESBE Incorporated","url":"https://esbeincorporated.org/","publisher":{"@type":"NGO","name":"ESBE Incorporated","url":"https://esbeincorporated.org/"}}<\/script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="ESBE Incorporated home">ESBE <span>INC.</span></a>
      <nav aria-label="Primary navigation">
        <a href="#mission">Mission</a><a href="#programs">Programs</a><a href="/community">Community</a><a href="/donate">Donate</a><a href="#transparency">Transparency</a><a href="#contact">Contact</a>
      </nav>
      <a class="header-cta" data-carry-params href="https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&amp;utm_medium=nonprofit_site&amp;utm_campaign=header_cta">Visit AIVA Claims <span aria-hidden="true">\u2197</span></a>
    </header>
    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <p class="eyebrow">501(C)(3) NONPROFIT \u2022 VETERANS \u2022 PUBLIC INTEREST</p>
        <div class="hero-grid">
          <h1 id="hero-title">Public-interest work that helps people move forward.</h1>
          <div class="hero-copy">
            <p>ESBE Incorporated builds practical tools and clear information for veterans and people navigating government-facing services.</p>
            <div class="hero-actions"><a class="button primary" href="#programs">See our public-interest work</a><a class="text-link" href="#transparency">How we operate <span aria-hidden="true">\u2193</span></a></div>
          </div>
        </div>
        <div class="hero-rule" aria-hidden="true"></div>
        <p class="hero-note">AIVA Claims is a program of ESBE Incorporated. ESBE Tech provides separate technical infrastructure. ESBE is independent and does not speak for or act on behalf of any government agency.</p>
      </section>

      <section class="statement" id="mission" aria-labelledby="mission-title">
        <div><p class="section-mark">01</p><a class="permalink" href="#mission" aria-label="Copy link to mission">#</a></div>
        <div><p class="eyebrow">OUR MISSION</p><h2 id="mission-title">Public systems should be easier to use when the stakes are high.</h2></div>
        <p class="body-large">We make information easier to understand and help people prepare for the next right step. Our work supports veterans and strengthens public-interest access to government-facing services through clarity, privacy, and accessible technology.</p>
      </section>

      <section class="programs" id="programs" aria-labelledby="programs-title">
        <div class="section-heading"><div><p class="section-mark">02</p><a class="permalink" href="#programs" aria-label="Copy link to programs">#</a></div><div><p class="eyebrow">PUBLIC-INTEREST WORK</p><h2 id="programs-title">Practical help for veterans and public service.</h2></div></div>
        <div class="program-grid">
          <article class="program-card featured-program" id="aiva-claims">
            <div class="program-top"><p class="program-kicker">VETERAN SUPPORT</p><span>01</span></div>
            <div class="featured-body">
              <div>
                <h3>AIVA Claims</h3>
                <p>Free, donor-funded help preparing your VA disability claim. You review, edit, and file everything yourself.</p>
                <div class="program-actions"><a class="button light" data-carry-params href="https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&amp;utm_medium=nonprofit_site&amp;utm_campaign=programs_cta">Create your free account <span aria-hidden="true">\u2192</span></a></div>
              </div>
              <ol class="program-steps"><li>Upload your records</li><li>Review your draft claim package</li><li>File it yourself with the VA</li></ol>
            </div>
            <p class="program-assurance">No cost to veterans \xB7 501(c)(3) nonprofit, EIN 87-1218291 \xB7 Not affiliated with the U.S. Department of Veterans Affairs</p>
          </article>
          <article class="program-card public-interest-card">
            <div class="program-top"><p class="program-kicker">CIVIC ACCESS</p><span>02</span></div>
            <div class="program-content"><div><h3>Public-interest services</h3><p>Accessible technology and plain-language information that help people understand and use government-facing services.</p></div></div>
          </article>
        </div>
        <section class="civic-projects" aria-labelledby="civic-projects-title">
          <div class="civic-projects-heading"><div><p class="program-kicker">SELECTED CIVIC PROJECTS</p><h3 id="civic-projects-title">Public tools for public systems.</h3></div><p>These independent public projects make government-facing information and reporting paths more understandable. They do not represent or act for a government agency.</p></div>
          <div class="civic-project-grid">
            <article class="civic-project"><p class="civic-project-meta">FEDERAL TRANSPARENCY \xB7 LIVE</p><h4>Hospital Ledger</h4><p>A public-good resource for exploring hospital price files published under federal transparency requirements.</p><a href="https://hospitalledger.com" rel="noreferrer">Visit Hospital Ledger <span aria-hidden="true">\u2197</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">SAN FRANCISCO PERMITS \xB7 PROTOTYPE</p><h4>SF Permit Navigator</h4><p>A plain-language permit-path prototype that identifies where an official city system is required.</p><a href="https://sf-permit-detector.barkleesanders.workers.dev" rel="noreferrer">Visit SF Permit Navigator <span aria-hidden="true">\u2197</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">BAY AREA 311 \xB7 LIVE</p><h4>ImproveBayArea</h4><p>One public reporting form that routes Bay Area requests to the appropriate official 311 service.</p><a href="https://improvebayarea.com" rel="noreferrer">Visit ImproveBayArea <span aria-hidden="true">\u2197</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">NATIONAL PARKS \xB7 LIVE</p><h4>NPS Report</h4><p>A public tool for reporting maintenance and safety concerns through National Park Service contact paths.</p><a href="https://nps-report.barkleesanders.workers.dev" rel="noreferrer">Visit NPS Report <span aria-hidden="true">\u2197</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">SF AFFORDABLE HOUSING \xB7 PROTOTYPE</p><h4>SF Income Verify</h4><p>A privacy-first income-verification prototype for San Francisco affordable housing. Not affiliated with MOHCD.</p><a href="https://sf-income-verify.barkleesanders.workers.dev/#how-it-works" rel="noreferrer">Visit SF Income Verify <span aria-hidden="true">\u2197</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">PUBLIC INFRASTRUCTURE \xB7 LIVE</p><h4>Treasure Island Power</h4><p>A public outage tracker documenting Treasure Island power failures and related accountability work.</p><a href="https://www.treasureislandsfpoweroutages.com" rel="noreferrer">Visit Treasure Island Power <span aria-hidden="true">\u2197</span></a></article>
          </div>
        </section>
        <div class="project-row"><p>Independent infrastructure</p><a href="https://esbe.tech" rel="noreferrer"><span>ESBE Tech</span><span aria-hidden="true">\u2197</span></a><a href="https://barkleesanders.com" rel="noreferrer"><span>Projects by Barklee Sanders</span><span aria-hidden="true">\u2197</span></a></div>
      </section>

      <section class="transparency" id="transparency" aria-labelledby="transparency-title">
        <div class="section-heading"><div><p class="section-mark">03</p><a class="permalink" href="#transparency" aria-label="Copy link to transparency">#</a></div><div><p class="eyebrow">TRANSPARENCY</p><h2 id="transparency-title">Clear identity. Clear accountability.</h2></div></div>
        <dl class="facts"><div><dt>Organization</dt><dd>ESBE Incorporated</dd></div><div><dt>Federal tax ID</dt><dd>87-1218291</dd></div><div><dt>Federal status</dt><dd>501(c)(3) nonprofit organization</dd></div><div><dt>Public purpose</dt><dd>Veteran support and public-interest access to government-facing services.</dd></div><div><dt>Program relationship</dt><dd>AIVA Claims is a program of ESBE Incorporated.</dd></div><div><dt>Government relationship</dt><dd>Independent nonprofit; not a government agency.</dd></div></dl>
        <div class="transparency-links"><a href="${determinationLetter}" rel="noreferrer">Read the IRS determination letter <span aria-hidden="true">\u2197</span></a><a href="https://apps.irs.gov/app/eos/" rel="noreferrer">Search the IRS Tax Exempt Organization Search <span aria-hidden="true">\u2197</span></a><a href="mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20transparency%20request">Request governance or filing information <span aria-hidden="true">\u2197</span></a></div>
      </section>

      <section class="contact" id="contact" aria-labelledby="contact-title">
        <div><p class="section-mark">04</p><a class="permalink" href="#contact" aria-label="Copy link to contact">#</a></div>
        <div><p class="eyebrow">PUBLIC CONTACT</p><h2 id="contact-title">Contact ESBE Incorporated.</h2><p class="contact-copy">For public inquiries, governance requests, and nonprofit correspondence, reach us by email or phone.</p><div class="contact-details"><a class="contact-email" href="mailto:help@esbeincorporated.org">help@esbeincorporated.org <span aria-hidden="true">\u2197</span></a><a class="contact-phone" href="tel:+18027153723">(802) 715-3723</a></div></div>
      </section>
    </main>
    <footer><div class="footer-brand">ESBE INCORPORATED</div><p>${disclosure}</p><div><span>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ESBE Incorporated</span><a href="#mission">Back to top \u2191</a></div></footer>
    <script type="module" src="/webmcp.js"><\/script>
    <script type="module" src="/ads.js"><\/script>
  </body>
</html>`)
);
app.get(
  "/donate",
  (c) => c.html(`<!doctype html>
<html lang="en">
  <head>
    <!-- Google tag (gtag.js) - GA4 ESBE Incorporated -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-YLVSKGE4LT"><\/script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-YLVSKGE4LT');
    <\/script>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Donate to ESBE Incorporated, a 501(c)(3) nonprofit. Your gift funds free VA claims help for veterans through AIVA Claims." />
    <meta name="theme-color" content="#12352d" />
    <link rel="canonical" href="https://esbeincorporated.org/donate" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ESBE Incorporated" />
    <meta property="og:title" content="Donate | ESBE Incorporated" />
    <meta property="og:description" content="Your gift funds free VA disability claims help for veterans. Donor-funded 501(c)(3) nonprofit." />
    <meta property="og:url" content="https://esbeincorporated.org/donate" />
    <meta property="og:image" content="https://esbeincorporated.org/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Donate | ESBE Incorporated" />
    <meta name="twitter:description" content="Your gift funds free VA disability claims help for veterans." />
    <meta name="twitter:image" content="https://esbeincorporated.org/og.png" />
    <link rel="stylesheet" href="/styles.css" />
    <title>Donate | ESBE Incorporated</title>
    <meta name="ai-summary" content="Donate to ESBE Incorporated, a 501(c)(3) nonprofit. Your gift funds free VA claims help for veterans through AIVA Claims." />
    <link rel="alternate" type="text/markdown" href="https://esbeincorporated.org/donate.md" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"NGO","name":"ESBE Incorporated","url":"https://esbeincorporated.org/","taxID":"87-1218291","email":"help@esbeincorporated.org","sameAs":["${determinationLetter}"]}<\/script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="ESBE Incorporated home">ESBE <span>INC.</span></a>
      <nav aria-label="Primary navigation">
        <a href="/#mission">Mission</a><a href="/#programs">Programs</a><a href="/donate" aria-current="page">Donate</a><a href="/#transparency">Transparency</a><a href="/#contact">Contact</a>
      </nav>
      <a class="header-cta" data-carry-params href="https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&amp;utm_medium=nonprofit_site&amp;utm_campaign=header_cta">Visit AIVA Claims <span aria-hidden="true">\u2197</span></a>
    </header>
    <main id="main">
      <section class="hero" aria-labelledby="donate-title">
        <p class="eyebrow">501(C)(3) NONPROFIT \u2022 DONOR-FUNDED</p>
        <div class="hero-grid">
          <h1 id="donate-title">Free help for veterans, funded by people who give.</h1>
          <div class="hero-copy">
            <p>AIVA Claims \u2014 ESBE's veteran support program \u2014 helps veterans understand and prepare VA disability claims at no cost to them. Donations pay for that work: the tools, the technology, and the time, so veterans never have to.</p>
            <div class="hero-actions"><a class="button primary" href="https://www.every.org/esbe-incorporated?frequency=once#/donate/pay" rel="noreferrer">Donate now <span aria-hidden="true">\u2197</span></a><a class="text-link" href="https://www.every.org/esbe-incorporated?frequency=monthly#/donate/pay" rel="noreferrer">Give monthly <span aria-hidden="true">\u2192</span></a></div>
          </div>
        </div>
        <div class="hero-rule" aria-hidden="true"></div>
        <p class="hero-note">Giving is processed securely by Every.org. ESBE Incorporated is an independent nonprofit and is not affiliated with the U.S. Department of Veterans Affairs.</p>
      </section>

      <section class="programs" id="gift" aria-labelledby="gift-title">
        <div class="section-heading"><div><p class="section-mark">01</p><a class="permalink" href="#gift" aria-label="Copy link to what your gift does">#</a></div><div><p class="eyebrow">SUPPORT THE MISSION</p><h2 id="gift-title">What your gift does.</h2></div></div>
        <div class="program-grid">
          <article class="program-card featured-program">
            <div class="program-top"><p class="program-kicker">DONOR-FUNDED</p><span>01</span></div>
            <div class="featured-body">
              <div>
                <h3>AIVA Claims</h3>
                <p>Free, donor-funded help preparing VA disability claims. Veterans review, edit, and file everything themselves \u2014 your gift keeps it that way.</p>
                <div class="program-actions"><a class="button light" href="https://www.every.org/esbe-incorporated?frequency=once#/donate/pay" rel="noreferrer">Donate <span aria-hidden="true">\u2192</span></a><a class="button light" href="https://www.every.org/esbe-incorporated?frequency=monthly#/donate/pay" rel="noreferrer">Give monthly <span aria-hidden="true">\u2192</span></a></div>
              </div>
              <ol class="program-steps"><li>Give once or monthly through Every.org</li><li>Your gift funds free help for veterans</li><li>ESBE reports its work publicly</li></ol>
            </div>
            <p class="program-assurance">No cost to veterans \xB7 501(c)(3) nonprofit, EIN 87-1218291 \xB7 CA Charity Registration CT0403243 \xB7 Not affiliated with the U.S. Department of Veterans Affairs</p>
          </article>
        </div>
      </section>

      <section class="transparency" id="donate-transparency" aria-labelledby="donate-transparency-title">
        <div class="section-heading"><div><p class="section-mark">02</p><a class="permalink" href="#donate-transparency" aria-label="Copy link to transparency">#</a></div><div><p class="eyebrow">TRANSPARENCY</p><h2 id="donate-transparency-title">Give with the facts in front of you.</h2></div></div>
        <dl class="facts"><div><dt>Organization</dt><dd>ESBE Incorporated</dd></div><div><dt>Federal tax ID</dt><dd>87-1218291</dd></div><div><dt>Federal status</dt><dd>501(c)(3) nonprofit organization</dd></div><div><dt>CA charity registration</dt><dd>CT0403243</dd></div><div><dt>Giving processed by</dt><dd>Every.org</dd></div><div><dt>Program relationship</dt><dd>AIVA Claims is a program of ESBE Incorporated.</dd></div></dl>
        <div class="transparency-links"><a href="${determinationLetter}" rel="noreferrer">Read the IRS determination letter <span aria-hidden="true">\u2197</span></a><a href="https://apps.irs.gov/app/eos/" rel="noreferrer">Search the IRS Tax Exempt Organization Search <span aria-hidden="true">\u2197</span></a><a href="mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20sponsorship%20or%20grant%20inquiry">Ask about sponsorships and grants <span aria-hidden="true">\u2197</span></a></div>
      </section>
    </main>
    <footer><div class="footer-brand">ESBE INCORPORATED</div><p>${disclosure}</p><div><span>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ESBE Incorporated</span><a href="/">Back to home \u2191</a></div></footer>
    <script type="module" src="/webmcp.js"><\/script>
    <script type="module" src="/ads.js"><\/script>
  </body>
</html>`)
);
const OG_PNG_BYTES = Uint8Array.from(atob(
  "iVBORw0KGgoAAAANSUhEUgAABLAAAAJ2CAIAAADAIuwLAAAQAElEQVR4nOzdBVgUWxsH8COgdIOCYqNid3dcC7u7u7u7u7u7u/Wz" +
  "sLu7FRRUFFERQdDvhdV13TkzOwtLzv93ee4zzs5szMzOnve8J0wcCuZkAAAAAAAAoDxGDAAAAAAAABQJASEAAAAAAIBCISAEAAAA" +
  "AABQKASEAAAAAAAACoWAEAAAAAAAQKEQEAIAAAAAACgUAkIAAAAAAACFQkAIAAAAAACgUAgIAQAAAAAAFAoBIQAAAAAAgEIhIAQA" +
  "AAAAAFAoBIQAAAAAAAAKhYAQAAAAAABAoRAQAgAAAAAAKBQCQgAAAAAAAIVCQAgAAAAAAKBQCAgBAAAAAAAUCgEhAAAAAACAQiEg" +
  "BAAAAAAAUCgEhAAAAAAAAAqFgBAAAAAAAEChEBACAAAAAAAoFAJCAAAAAAAAhUJACAAAAAAAoFAICAEAAAAAABQKASEAAAAAAIBC" +
  "ISAEAAAAAABQKASEAAAAAAAACoWAEAAAAAAAQKEQEAIAAAAAACgUAkIAAAAAAACFQkAIAAAAAACgUAgIAQAAAAAAFAoBIQAAAAAA" +
  "gEIhIAQAAAAAAFAoBIQAAAAAAAAKhYAQAAAAAABAoRAQAgAAAAAAKBQCQgAAAAAAAIVCQAgAAAAAAKBQCAgBAAAAAAAUCgEhAAAA" +
  "AACAQiEgBAAAAAAAUCgEhAAAAAAAAAqFgBAAAAAAAEChEBACAAAAAAAoFAJCAAAAAAAAhUJACAAAAAAAoFAICAEAAAAAABQKASEA" +
  "AAAAAIBCISAEAAAAAABQKASEAAAAAAAACoWAEAAAAAAAQKEQEAIAAAAAACgUAkIAAAAAAACFQkAIAAAAAACgUAgIAQAAAAAAFAoB" +
  "IQAAAAAAgEIhIAQAAAAAAFAoBIQAAAAAAAAKhYAQAAAAAABAoRAQAgAAAAAAKJQJS8gOrlnMAAAAAAAA4k6VFh1ZgoUMIQAAAAAA" +
  "gEIl7AyhSoKOyAEAAAAAIIFKBC0WkSEEAAAAAABQKASEAAAAAAAACoWAEAAAAAAAQKEQEAIAAAAAACgUAkIAAAAAAACFQkAIAAAA" +
  "AACgUAgIAQAAAAAAFAoBIQAAAAAAgEIhIAQAAAAAAFAoBIQAAAAAAAAKhYAQAAAAAABAoRAQAgAAAAAAKBQCQgAAAAAAAIVCQAgA" +
  "AAAAAKBQCAgBAAAAAAAUCgEhAAAAAACAQiEgBAAAAAAAUCgEhAAAAAAAAAqFgBAAAAAAAEChEBACAAAAAAAoFAJCAAAAAAAAhUJA" +
  "CAAAAAAAoFAICAEAAAAAABQKASEAAAAAAIBCISAEAAAAAABQKASEAAAAAAAACoWAEAAAAAAAQKEQEAIAAAAAACgUAkIAAAAAAACF" +
  "QkAIAAAAAACgUAgIAQAAAAAAFAoBIQAAAAAAgEIhIAQAAAAAAFAoBIQAAAAAAAAKhYAQAAAAAABAoRAQAgAAAAAAKBQCQgAAAAAA" +
  "AIVCQAgAAAAAAKBQCAgBAAAAAAAUCgEhAAAAAACAQiEgBAAAAAAAUCgEhAAAAAAAAAqFgBAAAAAAAEChEBACAAAAAAAoFAJCAAAA" +
  "AAAAhUJACAAAAAAAoFAICAEAAAAAABQKASEAAAAAAIBCISAEAAAAAABQKASEAAAAAAAACoWAEAAAAAAAQKEQEAIAAAAAACgUAkIA" +
  "AAAAAACFQkAIAAAAAACgUAgIAQAAAAAAFAoBIQAAAAAAgEIhIAQAAAAAAFAoBIQAAAAAAAAKhYAQAAAAAABAoRAQAgAAAAAAKBQC" +
  "QgAAAAAAAIVCQAgAAAAAAKBQCAgBAAAAAAAUCgEhAAAAAACAQiEgBAAAAAAAUCgEhAAAAAAAAAqFgBAAAAAAAEChEBACAAAAAAAo" +
  "FAJCAAAAAAAAhUJACAAAAAAAoFAICAEAAAAAABQKASEAAAAAAIBCISAEAAAAAABQKASEAAAAAAAACoWAEAAAAAAAQKEQEAIAAAAA" +
  "ACgUAkIAAAAAAACFQkAIAAAAAACgUAgIAQAAAAAAFAoBIQAAAAAAgEIhIAQAAAAAAFAoBIQAAAAAAAAKhYAQAAAAAABAoUwYxKJm" +
  "dWtYmJrK2fLT589b9h1msrmnS5svh0f2zO5pUrkGfw999sr7zsPHV2/fff8hQP6T1PesZG9rI1z/LTjYPyDw7sNH3r5vmT5i7vPK" +
  "YWxs3Kp+LWMjo6Bvwet37dO5fc2KZVM4OdHCmcvX7j1+KrZZgVw58uXISgtHTp974f2a6cPc1LRu1f883DM4OThYmJn6B3x68/bd" +
  "+as3zl65zqKKPmauLJlz5/DIkiFdKpcUIaEh7/wDnr18tXnfoa9B3/R6qlxZsxTJm4v70M9fv4KDvwd++frk5csHT54z2VI4O9X8" +
  "ryz3CX+EhX37Fvzc+zVdqL9+/WJRYmFuXiBn9lxZM7unT+tob/vl67e3/v437j3Yc+SEvs9ZqVTxtG4puQ+F//xJBzPwy5cbdx/6" +
  "vX/PooougOZ1a6iW9x8/9dpP1hcqf85s+XNmZ7K99Hlz+NRZiQ0M+8UUO8WhYWHfv39/5//h9sPHet2IAAAAIDYhIIxVTWpUTZIk" +
  "iZwtw8LCZQZIVCCeOXJQmpQumivTp05VvngRWrhx9/7QqXN+/vwp56ma16mRNKnUJfE1KGjY1DkPn71g8sTE55XPysKiXtWKtECB" +
  "gZyAsEXdmnQwaaFK2ZKNuvYLCQ3lbkYRXZ5sHrQQ/D1EfkBoZWkxsmfn7FkyaR4QZ0eHrO4Z6Ex9/BS4YM3GKISFpQoV6NuxVbKk" +
  "STVXurm4UMhat2rFu4+ejJuzmMIYmc9WrXzpkoXy69wsLDzs+LlLs5evlXNd5c3uUbtyBeltfvwIu3rn7rxVGz4EfGL66NCkfq1K" +
  "5TUPqZO9PV38RfLmbtug7vHzF+lNyg8Lm9er4Whnp3MzOu+rt+3cfeQE0189z0rqo5E+jdvgSTPl7FW7UoX8ufQICP0DAqQDQsN+" +
  "MeWcYgr756xcq1dVAgAAAMQONBlN2CgxuG72ZK1oUFOe7FnXzJroYGvLDMHK0nLGiIEUhLBEzczUdHivzsxwcmbJtHbWpBwemTVL" +
  "4ZqBioOd7bAenSqXKcFkS2piMq5fj8Hd2mtFg2r0WjmyZFo9c0K2TBmZQZkYm1QsWWz60P7MQKgagkK4BeOHJ0sqt4qKslKrpk+g" +
  "OETskNJzUsZv5bTxNlZWzKDMzUw7NWvUpKYn01/lMiXVy7k8MpsmS8aUgaL0mSMGjRvQkwEAAEA8gwxh3Ni4ez9VvUts8PlrEJNh" +
  "4sCeVDxlkUmbY2cu7jvm9er162TJkmVKm7ZRrapU4qSHKOkxZ+yQZj0GMtkOHD+lztUkM01mZW6e1i1l9szuVPg2MjIa1LXd+Ws3" +
  "foSFyX9CQ33eWJM/R7biBfJGpyWnGoUukwb3oeOm+ueDx89Wbd91//HT0B9hTg72japXqVS6hImJMT3Uo3UzOuyXb96R87SzRw+h" +
  "QrZqmZKZ2w/87/Kt2w+fvkhqYpwvZ3bKdqoepZBj2rD+nYeMefn6DZPt6ctXKzbv0FxjbGxMicesmTLQYVF9Fo9MGcoVK3z83EWZ" +
  "z0mJtW37/+aa6FpKmiwpXZwlCuY1i2y+SJHbpMF9+4yZrPOp6EMtmTRKHQm//xiw/eCRKzfvvvZ7a21lWa544QaeVRzsIho/p3B2" +
  "XDZlTOPu/cPDw5ls+46epCtcc425mVnqlC4Fc+dUR9fN6lSnr9vnr1+ZbBnSuqnelQodxsa1PFdt2alzx417DwjbMNMbUAXDOw8f" +
  "+/rv18dHdtNuw34xNU8xvTdzczMbK0uqtErnllL1VulrVbNSud2HjzMAAACINxAQxo2t+w4Hh4Sw6MmfKzul7Gjh58+fvUZOevrK" +
  "W7WeIo3r9+7TX50qFdo3rs8iY8J8ObJeu3Nf5jPvP+H17KWP1srsWdwnDepN2SEq25UvUeTQyTNMNoN83ljWr2PrK7fuijUclW/q" +
  "kL6qCIpO04jpc6/evqd+yP9jwLzVG/YcPTF/7HCKCenAdm/drEWvQTqfs3SRgupo8Oqde2NnLVS/Tzr7F67dpL//Shbr3a5FkkgT" +
  "BvZq2mMAky3wS5DwaqFIdedhZmttTTlnVTDWsEZVvQLCDbv3C9cvWL1h2vABGdK40bJHxvT0bnU28lS3kqUtt+w/rBlTffkaRPEG" +
  "/fVp35KOAK2hEHFwl/bj5i5isr187cv9smzac7Bg7hxj+nZnkQFP09rVFq7dxGRrUaemauH0pauqprlVSpeUExDeffiE/rRW0qur" +
  "oqxdh4+98//AosSwX0yxU5wyhfOUof1UzXHbNap77sp1dCkEAACIP9BkNAHL/idZ4fPGTx0Natpx8CglT1TLRfPlYdFDRVJKQKmW" +
  "yxYrzBI7SluN7N2FRQ/l0JwdHVTLE+Yt0YwG1V699p22ZKVq2dnBPmeWTNLPSeEl5RJVyxS6DJsymxu1/u/0uWmLV6iWHexsG9eo" +
  "ygwh8MuXPf87oX63LNooIBn/J1qjCCdPVg/p7dOlTlWy4O+OjvROxAKqGUtXn738O8FbvGDe1K4pmCFQVPz8T8dR93Rp5O9IH009" +
  "MMys5WtUp8zG2lI1QFHi9ubt+06DR1O4yCLbG08Y0JsBAABAvIGAMAH7/OV3ay7XFMnVLRK1eJ2/RJu9ff/h46dAFm3+f8LLH6E/" +
  "WOJ14fpN1ULe7FmLF8jLoqFW5fKqhdd+7yQaoHpduEyniVKIfu/97XV1+Gxet4aFuRmLzI+Nn7NQYsvj5y49e/m7pqBSaT06KEr7" +
  "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" +
  "r31nLVtTu30PRIMAAADxUBKHgjlZgnVwzWL6f5UWcdCRKR6ytbbOmimDs4ODjZUlFdlv3nuAplnxEEVQ6VKlTOuWytrS4pm3z73H" +
  "T6nEzKKN0o+Z06d1c00R+PXL05fez156G6TXXIJAial0qVO6p01DF7/vu/f08V+98cWwJQAAABALEkE8giajiQclCS/8GZEf4i0K" +
  "/24/fEx/zKD83r+nP6ZIlAJ99tKH/hgAAAAA6AlNRgEAAAAAABQKASEAAAAAAIBCISAEAAAAAABQKASEAAAAAAAACoWAEAAAAAAA" +
  "QKEQEAIAAAAAACgUAkIAAAAAAACFQkAIAAAAAACgUAgIAQAAAAAAFAoBIQAAAAAAgEIhIAQAAAAAAFAoBIQAAAAAAAAKhYAQAAAA" +
  "AABAoRAQAgAAAAAAKBQCQgAAAAAAAIVCQAgAAAAAAKBQCAgBAAAAAAAUCgEhAAAAAACAQiEgBAAAAAAAUCgEhAAAAAAAAAqFgBAA" +
  "AAAAAEChEBACAAAAAAAoFAJCAAAAAAAAhUJACAAAAAAAoFAICAEAAAAAABQKASEAAAAAAIBCISAEAAAAAABQKASEAAAAAAAACoWA" +
  "EAAAAAAAQKEQEAIAAAAAACgUAkIAAAAAAACFQkAIAAAAAACgUAgIAQAAAAAAFAoBIQAAAAAAgEIhIAQAAAAAAFAoBIQAAAAAAAAK" +
  "hYAQAAAAAABAoRAQAgAAAAAAKBQCQgAAAAAAAIVCQAgAAAAAAKBQCAgBAAAAAAAUCgEhAAAAAACAQiEgBAAAAAAAUCgEhAAAAAAA" +
  "AAqFgBAAAAAAAEChEBACAAAAAAAoFAJCAAAAAAAAhUJACAAAAAAAoFAICAEAAAAAABQKASEAAAAAAIBCISAEAAAAAABQKASEAAAA" +
  "AAAACoWAEAAAAAAAQKEQEAIAAAAAACgUAkIAAAAAAACFQkAIAAAAAACgUAgIAQAAAAAAFAoBIQAAAAAAgEIhIAQAAAAAAFAoBIQA" +
  "AAAAAAAKhYAQAAAAAABAoRAQAgAAAAAAKBQCQgAAAAAAAIVCQAgAAAAAAKBQCAgBAAAAAAAUCgEhAAAAAACAQiEgBAAAAAAAUCgE" +
  "hAAAAAAAAAqFgBAAAAAAAEChEBACAAAAAAAoFAJCAAAAAAAAhUJACAAAAAAAoFAICAEAAAAAABQKASEAAAAAAIBCmTCAWGFkZJTc" +
  "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" +
  "9w2ZNUvsSahAtmD4ML0OtX9AQL56v5txUhTnWbqUXrvPXrtu+qpV3IcoldEsSlPSU3m3QZ++t0SmuTcIKgU+OrDfSJ/pQDRL4eun" +
  "TCmRL69eB2qfl5e6LeXdPbslEh1CVCjvNHr0Qd6IoBTKHlq8mOmDGxASSgPOGjwoat/ToODgGl27CacW6FC//tCOHfR9TqoOoCiC" +
  "UiUyt6ezeWjpEvfUqVmUbDl8uN+UqcL1m2dMLyo53JS3r+9Tb2+qP6Kal5QpUqRPlUqr1y5FL6Vbtgz4/JlJ6tuqVc/mzZhsMRcQ" +
  "kus7tjlqzBp648EDOrPyd3988IBmPu3YhQuth0ZxlGA6rTvnzOa2m6Ub8umr16mihK6srBkzVi5enJvJH794yeItovMfurm4nFm7" +
  "xkjPOYHoyzhw+gyxBhpRuAN/DwmhkFtrJf08Xd++VWfzBMqj0gXGAADiQiIICNFkVNGooNmob3+xfhpCmw4cKNGshTCTJp/5v6MI" +
  "UDLw2v17WtvQb3+B7Nnb1atLcVTbOnWF0SC94b5TpkpEgyxyuAJ9C99mGr1Z7Gys9d3d1spK7CF6q4NmzJR/nFUePn9WrEnzGI0G" +
  "WWTjVX0LgpqD8dhZW+l7oOw0ynZ6pYNY5LsV63R078lTvQbTp4QV5Wa5D+08dqxE8+ZRGLeWdinetDl3ojmKe6MQYRpFkr895d+o" +
  "FmbK8uVio/ZL7Dhu0WJuNBjxaOjftB4dZGHrXEpLUkVPo6pV6f+Z06bVjAZpY4ozCzRooDMaJDPXrOF23hPz4NkLFmP+9+9Yo0v+" +
  "bUar08nLVzT/ueXQIRZVdHY8O3dZvmO7sBEy3R6bVvMc3a3rqK5dKbktDJzefvjQsG8/iWiQmOh5manQ9SyR6I7CHZg7yhd95JZD" +
  "hujalVlFdUAmAABgCAhjn84O/dK+fvvGDOrS7dsFGzSi2EN6s6v37lVs337A9N/jfWsOSU+fiEqflBihDBtVV9998uTc9euUBVqx" +
  "nTO4uWYB4uKtW3PWra/VrUfhRiy2J5oAABAASURBVI0PnTkrZ1p52mbP8eO5atXZeviw9Jafv+o9Q4NmR6mv3/QL3kjg168Sj27Y" +
  "vz9Hjdrr9+3nToCu5fr9+1T++69dh4/6FI6jhjvWvzTNWem4s1lK0zy24eHhTE+fg0SPc/PBgymqkb6QQkJDj5w7V6Vjp7x16km0" +
  "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" +
  "cRddxnSCkjs6pnBwcLS3c7Kzs7e1s7O2srG0srIw//mL1ezW/WPg77HpKDLp3rRp/cqVhAOa+wcE7Dp2fN76DR8/B7IoodLnlP59" +
  "c7i70yVHb0zzoZ8/fwYFB1OpdNbatW/evVswfBiVt2j9nuPHu42fwKKHDn7EQaA/Zycne3snO3v6v72tjb21Nf2kWZpbmJuZDpw+" +
  "48SlS6rt6aWbVvNsV69e+lSpVG9Djd7kiYuX6E1G56utEjuXBz1z9bJlGlSqnC9bVktzc+EG9NV+5ev3v3PnVu3aRSVaOc9JXxm6" +
  "ouiQUpHROeLP3t7GxsHW1s7Ghh6iAhwFtA379lNvn8bVdVC7tuWKFLYw++cN0El//ub12t171uzeGxYel03dqOKjV4vmZQsV4h4i" +
  "ujvdfPhw2+EjWw4fpvfMDErz4nR2cIy8Pu3UFyd9H42NjJsOGPjMx0dzl57NmjWqWkV46/72PXif16mRc+dKVGy5ubhM6Nkjj0dW" +
  "GyvOrW/zoYMLNm5i0VYoZ85m1aqVLJhfeCdRofvJmavX1u3bd+n2bYnnoRtFy5o1KSZh8nz68nnj/gPC9cXy5smdxUPn7s+8Xx0+" +
  "e05igzi5VOguVDRPbqMk/9wlrK0shVumSpGc+yNLJ/fK3btMF0OdNU0U/Lg6O6WI+A1yiLhj2NtTCO2ocbu4+fBRx1Gj1NvTh21b" +
  "p077+vXoe6G6Puke5e3n23rocB+/ty1q1uDeLbn2eZ2kWItFm8yLkM74mt17gkP4Xz0DlrhU6EA52tm6Oid3jTy2dGAd7ezpPmxv" +
  "8/t3zcw0WfuRI289/Fuj6p469YgunQvlyqm+FdMVu37fvlHzFzB5HGztOtSvV6t8Ofo4Wj+O9P4/B32lm//Srdv3e3kxiHlJHArm" +
  "ZAnWwTWL6f9VWnRk8d7jgwe0yqz6om9apipVhesbVakypV9frZVvP3wo2KChaplu6ON79kzvlopJeu7zum6vnv4Beg8zXTRPnmEd" +
  "O+TMnFnm9lSH1H/qtAOnT4ttcGDRwhyZMrHoKd+m7eOXL1m0xfnhVRnTrZv8n67TV691GzdOZq7m3Pp1VKTTWjlq/vwVO3ZqrZzS" +
  "t0+jqlWZLnV69KSyAt3cx/Xo0ax6Na27vBb6odp38mTPiZP1LcH3bdWqa5NGFAXp3JJqWNS/lxR9tRwyhEUDne4NU6fo3Ix+yIfN" +
  "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" +
  "6HUN1R/J9/17boHPNYZHT03EXrzmd6hLq3/TyuSO/N5ou4+fYLrQaT195apwfcrkybO7u9NC39atVWuoYD1p2XKdT5i4L5V4ctZi" +
  "wiJe1z4zU1OKCbs0+TtkqOYwM5pOX+VcRdUif7/yZs2q+mdA4OfHIsOJaUrQJa7bjx5z16fTNT0GxD4EhPGLmWkyFr/Z29hwp9O9" +
  "9+TppoMHWSxKmjQRDol0JHIuI6FOGhPgJjLWvM5pHz8Hak5cbm1psXbixHlDhy4cMVzObM5X7t4t37pNp1GjubWhxfLkZvGM2HQI" +
  "mw78852Kncvjws1b3PVF9T9u5rwh5u49fcJiEt2juCWhq3fvMMPhJhud7O1zZcnMQH87/neMu75gjuxMT9yxZKk64GOgrN5o45fy" +
  "JxUc1rFDaleXzGl/N3W7fOeOzNn2EvGlEn/OmsG98vXlthptXbtWrfLlVcs/wsI2HjjA3X3O2nXClXY21v1at1ZHd/+7cJ7pEn9K" +
  "XFGz6xj/CimaO979CgMCwvjFxtKSxW+Fcubgrp+zbh2LXWZmUWnDFs9RIYMbw3hkSJ8oO2FTAYuCPeH68zduav5Tc8TRbk2aMHkO" +
  "nD7NncjeI2NGFs9kd88kXEkhsdYQhbFzeWw+fIi7vmP9BkwflNHlBmZHz4F+/RIAABAASURBVOs3zLq+GlSuzF2/5fARZjjX79/n" +
  "rh/Svj0D/R08fZqbv61YojjTB91P3Fw4vdHuP5M1dAd58Ow5dyq5onnyjOnWTf3PcQsXM3kS8aUSf85aTDjMq4D7r1ix5H+6Rl+8" +
  "dUusBeb1Bw+4TS26N/37+7V4s+756ONPiStqqHKW2wchc7p03DMOcQgBYfxiFe8DwrwiA/2fvXFDcj/+yGPRac5uYZoIx96kA8Id" +
  "oIxF1k8z/R1dvuzJoYMta9Vi8dLgdvwi0YrtOzT/GRL6d+qkgjlyyB/WfPOhQ5oDgqvE/sRW0jxLl7ay4FzMB7xOaa2JncvD69Jl" +
  "7tTS+mYIO/PyllR8XLN7D4tJ7erVFa6kT3Tg1ClmOAs38QeLp7CBW8chjfZ6dezo7nlzk4sMw5Po0YXxlDcNg4ONbaa0eow/0aVx" +
  "Y241xNwNG5hsS7ZuE66k+0b5IkVUyzpnm9CUiC+VeHXWDG7hpk3ClZpzw3LTgGr7vLyEK9Uf8+PnQDntReNPiSvKHj5/wV0/NEq/" +
  "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" +
  "qWnzmtVzZclsYmT84vWbsPAwBgAAED8kgngkiUPBnCzBOrhmMf2/SouODABiWLcmjTs3amxmmiypSAjE9fPnz6Dg4Jy1atMCS/hy" +
  "Zs68YcpkczMzsd5uXL9+/aLAuPv48UfPX2CgYfWECYVy5TQ3NTUy0qO5yo+wsLtPntTo2o0BAADEtUQQj+hRsAMAJUvn5mZtacH0" +
  "RAV9a0tLllg42NrYWlszPVHW1NLcnNu4VOHc06SmI8P0RFUSaV3RghQAAMAwEBACgCyJI8UXTeHhUT8I4TiAAr/ov6jtmCSKOwIA" +
  "AIAWBIQAIMvYhYv2e3kx/X0JCko0weSZa9ea9B9gbByV4bhOX73G4F+N+w/I4Oam/37std9bBgAAAIaAgBAAZKG4zuvyFaZ4FBMy" +
  "MBBvXz/6YwAAABB3MO0EAAAAAACAQiEgBAAAAAAAUCgEhAAAAAAAAAqFgBAAAAAAAEChEBACAAAAAAAoFAJCAAAAAAAAhUJACAAA" +
  "AAAAoFAICAEAAAAAABQKASEAAAAAAIBCISAEAAAAAABQKASEAAAAAAAACoWAEAAAAAAAQKEQEAIAAAAAACgUAkIAAAAAAACFQkAI" +
  "AAAAAACgUAgIAQAAAAAAFAoBIQAAAAAAgEIhIAQAAAAAAFAoBIQAAAAAAAAKhYAQAAAAAABAoRAQAgAAAAAAKBQCQgAAAAAAAIVC" +
  "QAgAAAAAAKBQCAgBAAAAAAAUCgEhAAAAAACAQiEgBAAAAAAAUCgEhAAAAAAAAAqFgBAAAAAAAEChEBACAAAAAAAoFAJCAAAAAAAA" +
  "hUJACAAAAAAAoFAICAEAAAAAABQKASEAAAAAAIBCISAEAAAAAABQKASEAAAAAAAACoWAEAAAAAAAQKEQEAIAAAAAACgUAkIAAAAA" +
  "AACFQkAIAAAAAACgUAgIAQAAAAAAFAoBIQAAAAAAgEIhIAQAAAAAAFAoBIQAAAAAAAAKhYAQAAAAAABAoRAQAgAAAAAAKBQCQgAA" +
  "AAAAAIVCQAgAAAAAAKBQCAgBAAAAAAAUCgEhAAAAAACAQiEgBAAAAAAAUCgEhAAAAAAAAAqFgBAAAAAAAEChEBACAAAAAAAoFAJC" +
  "AAAAAAAAhUJACAAAAAAAoFAICAEAAAAAABQKASEAAAAAAIBCISAEAAAAAABQKASEAAAAAAAACoWAEAAAAAAAQKEQEAIAAAAAACgU" +
  "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" +
  "eoRa2xU9t3zm8oVrrfj/T5PNZu6CRenB6b16lnpCnxOOTctE6by1PNWuVSud7xfC9j+XVc6eh6/8/e21hRX7Wttv/8PjS3+2obPj" +
  "hO5HpsdPFy8nWyly3/dvXagAv/BKUefOwfvv22Gf9skmWLSkaNmeE3scWdY5u+xctAvI8o8rZ8VaALZsAmGVEGpEjxVXybLNW/hB" +
  "iEzp8aUDB4RWYIkTQqPwigvODeWX9H/ve+SpfDYGzH3RzWHYyJvTCBry5zWDLtj4W6MnFE126nTAfsMHX5g9ku3E7kdmfmTmnPdC" +
  "WSDZgjz8zHNpKezoLp2aN9k9KayYbdaw8Q0r9dZ37nhAOuJx5WefzZ2/qNQfvL94ElTbFs23q1kz91XC2/7asvf5eP4vRSN4zzj5" +
  "uP6nlYyX6YcofT6ffraqcpcnqZg/v/xqehC6QjLTSjMaN9z1lGO7p8dvz3gnyU+oKI6+9vL0OM9hrnm679Giknjf3idk5oVmhKps" +
  "uG66eE/osZr81LNJ5cl936uCG2+b8NmqoiWmhl5w9qaM1J30xNPpQdsWe9x0xeDs7VhP6NGtTfNmSWHd+K9vvJkAQHksKlNVjL9/" +
  "cueO3083VMg2ctyde7VuVbdO7dBsPbP38Ud1PuSNqdPfmvFOzW233XfPth33ax96/dMzZ8+b/2De1bPcF610C5cs/f2fXuh1VNek" +
  "cPGJQzvs/5fXi9orU15+9fCDO4Tu86Sw+Tt57KhX3pwamrkrP1u1355t92+/Z6iOpmeuXvOv/7np18mW5Yu162a8O6d929aNGxb9" +
  "mg+W12Lud+pJJ+aciPXmtJn57DOZQ4d99sq92+HHn6z41YR7kzyUeutP63VM+t0pL5c5ODZUV1atXr19zZrhnd+39/G33fdg7gtN" +
  "nTnrxb+9XupoursmP9r1kI477Vg7Kai5HXP0YZ3eX7hw+qw56zesb9O8efs2rWrvULROzITJjyZVQCgrndPnlHp1Cqb4hhDb4/BD" +
  "35nz/vTZs+vXq9eiaeN927VJy4Pr1q2/5Z5J2T/esmmTjW9fKL/XqV2ryW67ZfbEm/DgIyV+pGbN75V1x1evWfO/t96RlG3yU3/o" +
  "eUSXBvV3Ds/q/L4/7N3z6GemvPTOe3N3rLXD/u3bHnVYp8wwhJvG3VXpE4Bz3PcK22nHHXO//4Mbxv4mnx3/QnfPiDF3jBhaMDg/" +
  "vJkHn9MvRMSKXWvWe++/PnVaWmYMfzEmj/vl+wsXzZg9d9ny5S2bNWvbstnuDYr+hrz897cra09LALZsAmEVMuzG0beNuLrUVQdC" +
  "F3j/Sy4fddWQVs2aJoWbE4a2ddq83lgoJOZutH2ti24OY+99oMvBHdL4OvjcAa++9Y/MTgPX3jz2vDNOP6F7t6Rw8YlunQ7KHh/7" +
  "wT8/vGT4yKpQval09z32VLqpWvCvL74od0Ga1ns0zX1CSD6bGAhDFEnTSFm+WLs2z0CYZN36abPmtCgeADzpiVx7Lb7wyus/OKJg" +
  "GG3oByk3ECaFvSffb98u3bdjY+Gd1m/Q5TcOuzSUVpLCJVXq1tnrgL332vic0HAfNf6u5//6alI1DBs5+uarh6a7F9SvVzd8pVtx" +
  "ZIRq2/DR40rNJCHfhr6Vsh75yT9Oyd64r3q16mX9SCg3lfu3ZeDQq2+57sq0U2PX+vX6l7Z+zz2/e2wzbRhY1n2vsO9ts02OFzBV" +
  "r07tPLeAf3PGzNCLd8A+Be+3IzodFD6bs99fULFrXfmLMef2OfWkYwr6g0JNu13LFuGrxMnPTnkpM+wCAHIzZPSbs654b8D1G0rf" +
  "JHDBB0syG3Nn57PQnP3ZVSNGjb87e9pPaKvNmbcgtBJG3DK+xNoSFb5o5vx8Rp+mNmwoOvPLpMxdEMPTy6wKGJq5F/Tvs/F3Q3N/" +
  "0PAbZs55L3uFjGXLP75j0kNnD7my1PUYk5xbL2Y/i6yDrz5U8S+yIe+FOjbd2zNmZQaV5Vi4P/+nVNaZmdf2yzLeEmW9VXI8VAVu" +
  "/XX//bO0GyKE/NyDY+9/5Mn0IJRW9mnXJvPvGzaU/gsWbu8+LvtJJoUfokHX3vD4c8+nyzBubO3adYuWLL3omhs2RxrMfIg25P8m" +
  "LTT/g8VnXHRZqAitzSqphd9r2qzZ518xvMRegjluX3iQlZ+uemvGOwMvv2bsxEnJpsl+/4S638Ch19w1+ZGPV5Qyp3H2vPnnXnbV" +
  "A0/kOX6hzA9pBe57qT9e1gdk7bqvcZMyr/aXhc8z3SmkLNePuT2znM8VPz23wtcKxv/2oRCAs+eOhhdh+YoVY+6+P3caLPePAABR" +
  "2arugXsn31nPTLw9/Ldn34FJZLaruW3LZk13b7hrUrDyxMK58xdWtT0YNlG1atWaN2nUommTatW2XrJ02ex5C/LZ5B3y16B+/RZN" +
  "d9+53k6ff77mzekzN31n+c0tfOQbNdilzo47rF69ZsHiJVX8Ux9KwXs0adS4YcNQw5wzb2H4M7VB9tgMwuvcunmzXXauu/VWW8+Y" +
  "M6esubgAbD5bQB4RCAEAACpiC8gjhowCAABESiAEAACIlEAIAAAQKYEQAAAgUgIhAABApARCAACASAmEAAAAkRIIAQAAIiUQAgAA" +
  "REogBAAAiJRACAAAECmBEAAAIFICIQAAQKQEQgAAgEgJhAAAAJESCAEAACIlEAIAAERKIAQAAIiUQAgAABApgRAAACBSAiEAAECk" +
  "BEIAAIBICYQAAACREggBAAAiJRACAABESiAEAACIlEAIAAAQKYEQAAAgUgIhAABApARCAACASAmEAAAAkRIIAQAAIiUQAgAAREog" +
  "BAAAiJRACAAAECmBEAAAIFICIQAAQKQEQgAAgEgJhAAAAJESCAEAACIlEAIAAERKIAQAAIiUQAgAABApgRAAACBSAiEAAECkBEIA" +
  "AIBICYQAAACREggBAAAiJRACAABESiAEAACIlEAIAAAQKYEQAAAgUgIhAABApARCAACASAmEAAAAkRIIAQAAIiUQAgAAREogBAAA" +
  "iFT15LvvmYm3JwAAAHxNKoQAAACR2qrugXsnAAAAxEeFEAAAIFICIQAAQKQEQgAAgEgJhAAAAJESCAEAACIlEAIAAERKIAQAAIiU" +
  "QAgAABApgRAAACBSAiEAAECkBEIAAIBICYQAAACREggBAAAiJRACAABESiAEAACIlEAIAAAQKYEQAAAgUgIhAABApARCAACASAmE" +
  "AAAAkRIIAQAAIiUQAgAAREogBAAAiJRACAAAECmBEAAAIFICIQAAQKQEQgAAgEgJhAAAAJESCAEAACIlEAIAAERKIAQAAIiUQAgA" +
  "ABApgRAAACBSAiEAAECkBEIAAIBICYQAAACREggBAAAiJRACAABESiAEAACIlEAIAAAQKYEQAAAgUgIhAABApARCAACASAmEAAAA" +
  "kRIIAQAAIiUQAgAAREogBAAAiJRACAAAECmBEAAAIFICIQAAQKQEQgAAgEgJhAAAAJESCAEAACIlEAIAAERKIAQAAIiUQAgAABAp" +
  "gRAAACBSAiEAAECkBEIAAIBICYQAAACREggBAAAiJRACAABE6t8AAAD//zBY+FAAAAAGSURBVAMAZc14Rlu0fhcAAAAASUVORK5C" +
  "YII="
), (ch) => ch.charCodeAt(0));
app.get("/og.png", (c) => c.body(OG_PNG_BYTES, 200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" }));
app.get(
  "/community",
  (c) => c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="ESBE Incorporated's community work on Treasure Island: public documentation of power outages and plain-language paths to official reporting channels for residents." />
    <meta name="theme-color" content="#12352d" />
    <link rel="canonical" href="https://esbeincorporated.org/community" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ESBE Incorporated" />
    <meta property="og:title" content="Treasure Island Community Work | ESBE Incorporated" />
    <meta property="og:description" content="Public documentation of Treasure Island power outages and clear paths to official reporting channels for residents." />
    <meta property="og:url" content="https://esbeincorporated.org/community" />
    <meta property="og:image" content="https://esbeincorporated.org/og.svg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Treasure Island Community Work | ESBE Incorporated" />
    <meta name="twitter:description" content="Public documentation of Treasure Island power outages and clear paths to official reporting channels for residents." />
    <meta name="twitter:image" content="https://esbeincorporated.org/og.svg" />
    <link rel="stylesheet" href="/styles.css" />
    <title>Treasure Island Community Work | ESBE Incorporated</title>
    <meta name="ai-summary" content="ESBE Incorporated's community work on Treasure Island: public documentation of power outages and plain-language paths to official reporting channels for residents." />
    <link rel="alternate" type="text/markdown" href="https://esbeincorporated.org/community.md" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"NGO","name":"ESBE Incorporated","url":"https://esbeincorporated.org/","taxID":"87-1218291","email":"help@esbeincorporated.org","sameAs":["${determinationLetter}"]}<\/script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="ESBE Incorporated home">ESBE <span>INC.</span></a>
      <nav aria-label="Primary navigation">
        <a href="/#mission">Mission</a><a href="/#programs">Programs</a><a href="/community" aria-current="page">Community</a><a href="/donate">Donate</a><a href="/#transparency">Transparency</a><a href="/#contact">Contact</a>
      </nav>
      <a class="header-cta" data-carry-params href="https://aivaclaims.com/sign-up?utm_source=esbeincorporated.org&amp;utm_medium=nonprofit_site&amp;utm_campaign=header_cta">Visit AIVA Claims <span aria-hidden="true">↗</span></a>
    </header>
    <main id="main">
      <section class="hero" aria-labelledby="community-title">
        <p class="eyebrow">COMMUNITY • TREASURE ISLAND • PUBLIC INFRASTRUCTURE</p>
        <div class="hero-grid">
          <h1 id="community-title">Dependable power is a community issue on Treasure Island.</h1>
          <div class="hero-copy">
            <p>ESBE Incorporated supports public documentation and accountability work for Treasure Island residents. The goal is practical: make outage information easier to find, understand, and act on for the people who live on the island.</p>
            <div class="hero-actions"><a class="button primary" href="https://www.treasureislandsfpoweroutages.com" rel="noreferrer">Visit Treasure Island Power <span aria-hidden="true">↗</span></a><a class="text-link" href="#resident-paths">Resident resources <span aria-hidden="true">↓</span></a></div>
          </div>
        </div>
        <div class="hero-rule" aria-hidden="true"></div>
        <p class="hero-note">ESBE Incorporated is an independent nonprofit. It is not a government agency and does not speak for the City and County of San Francisco, the San Francisco Public Utilities Commission, or the Treasure Island Development Authority.</p>
      </section>

      <section class="statement" id="why" aria-labelledby="why-title">
        <div><p class="section-mark">01</p><a class="permalink" href="#why" aria-label="Copy link to why this work matters">#</a></div>
        <div><p class="eyebrow">WHY IT MATTERS</p><h2 id="why-title">An island community feels every outage.</h2></div>
        <p class="body-large">When the power fails, households, small businesses, and neighbors who rely on electricity are affected together. A clear public record of what happened, and a clear path to the right official channel, helps residents ask for reliable service with facts in hand.</p>
      </section>

      <section class="programs" id="resident-paths" aria-labelledby="paths-title">
        <div class="section-heading"><div><p class="section-mark">02</p><a class="permalink" href="#resident-paths" aria-label="Copy link to resident resources">#</a></div><div><p class="eyebrow">COMMUNITY RESOURCES</p><h2 id="paths-title">Where Treasure Island residents can start.</h2></div></div>
        <section class="civic-projects" aria-labelledby="ti-projects-title">
          <div class="civic-projects-heading"><div><p class="program-kicker">PUBLIC INFRASTRUCTURE</p><h3 id="ti-projects-title">Treasure Island Power.</h3></div><p>A public outage tracker documenting Treasure Island power failures and related accountability work. Its records are community-compiled and are not a live power feed. It is an independent public project and is not affiliated with SFPUC or TIDA.</p></div>
          <div class="civic-project-grid">
            <article class="civic-project"><p class="civic-project-meta">OUTAGE TRACKER \xB7 LIVE</p><h4>Treasure Island Power</h4><p>The public record of outages and related accountability work for Treasure Island.</p><a href="https://www.treasureislandsfpoweroutages.com" rel="noreferrer">Visit Treasure Island Power <span aria-hidden="true">↗</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">REPORT</p><h4>Report an outage</h4><p>Report a power outage on Treasure Island through Improve Bay Area or San Francisco 311.</p><a href="https://www.treasureislandsfpoweroutages.com/report" rel="noreferrer">Report an outage <span aria-hidden="true">↗</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">RESIDENTS</p><h4>Resident resources</h4><p>Emergency alerts, claim forms, advocacy tools, and press coverage collected for Treasure Island residents.</p><a href="https://www.treasureislandsfpoweroutages.com/resources" rel="noreferrer">Open resident resources <span aria-hidden="true">↗</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">PUBLIC RECORDS</p><h4>Record requests</h4><p>Public records requests filed in the Treasure Island and Yerba Buena Island grid investigation.</p><a href="https://www.treasureislandsfpoweroutages.com/records" rel="noreferrer">View record requests <span aria-hidden="true">↗</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">MAP</p><h4>Infrastructure map</h4><p>An interactive map of Treasure Island grid infrastructure and outage history.</p><a href="https://www.treasureislandsfpoweroutages.com/map" rel="noreferrer">Open the map <span aria-hidden="true">↗</span></a></article>
            <article class="civic-project"><p class="civic-project-meta">POWER QUALITY</p><h4>Power quality log</h4><p>A log of voltage sags, swells, transients, and interruptions recorded by a power-quality meter on Treasure Island.</p><a href="https://www.treasureislandsfpoweroutages.com/power-quality" rel="noreferrer">Open the power quality log <span aria-hidden="true">↗</span></a></article>
          </div>
        </section>
        <div class="project-row"><p>For an emergency, call 911</p><a href="/"><span>ESBE Incorporated home</span><span aria-hidden="true">↗</span></a><a href="/donate"><span>Support ESBE's work</span><span aria-hidden="true">↗</span></a></div>
      </section>

      <section class="transparency" aria-labelledby="community-transparency-title">
        <div class="section-heading"><div><p class="section-mark">03</p></div><div><p class="eyebrow">TRANSPARENCY</p><h2 id="community-transparency-title">Clear identity. Clear accountability.</h2></div></div>
        <dl class="facts"><div><dt>Organization</dt><dd>ESBE Incorporated</dd></div><div><dt>Federal tax ID</dt><dd>87-1218291</dd></div><div><dt>Federal status</dt><dd>501(c)(3) nonprofit organization</dd></div><div><dt>Government relationship</dt><dd>Independent nonprofit; not a government agency.</dd></div></dl>
        <div class="transparency-links"><a href="${determinationLetter}" rel="noreferrer">Read the IRS determination letter <span aria-hidden="true">↗</span></a><a href="mailto:help@esbeincorporated.org?subject=ESBE%20Incorporated%20community%20inquiry">Contact us about this work <span aria-hidden="true">↗</span></a></div>
      </section>
    </main>
    <footer><div class="footer-brand">ESBE INCORPORATED</div><p>${disclosure}</p><div><span>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ESBE Incorporated</span><a href="/">Back to home ↑</a></div></footer>
    <script type="module" src="/webmcp.js"><\/script>
    <script type="module" src="/ads.js"><\/script>
  </body>
</html>`)
);
app.get("/security.txt", (c) => c.redirect("/.well-known/security.txt", 302));
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));
var index_default = app;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
