(function (global) {
  "use strict";

  var SDK_VERSION = "1.0.0";

  var DEFAULTS = {
    baseUrl: "",
    flow: "test",
    testId: "",
    assignmentId: "",
    endpoint: "",
    mode: "inline",
    locale: "en-US",
    width: "100%",
    height: "760px",
    launchText: "Start Test",
    title: "Testing",
    closeOnEsc: true,
    allowFullscreen: true,
    query: {},
    studentToken: "",
    theme: {
      primaryColor: "#314dcc",
      accentColor: "#1e1f1b",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
      borderRadius: "14px",
    },
    events: {
      onReady: null,
      onComplete: null,
      onExit: null,
      onError: null,
    },
    customCss: "",
  };

  var ATTRIBUTE_MAP = {
    "base-url": "baseUrl",
    flow: "flow",
    "test-id": "testId",
    "assignment-id": "assignmentId",
    endpoint: "endpoint",
    mode: "mode",
    locale: "locale",
    width: "width",
    height: "height",
    "launch-text": "launchText",
    title: "title",
    "close-on-esc": "closeOnEsc",
    "allow-fullscreen": "allowFullscreen",
    "student-token": "studentToken",
    "primary-color": "theme.primaryColor",
    "accent-color": "theme.accentColor",
    "background-color": "theme.backgroundColor",
    "text-color": "theme.textColor",
    "font-family": "theme.fontFamily",
    "border-radius": "theme.borderRadius",
  };

  function isObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function deepMerge(base, update) {
    var output = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (!isObject(update)) return output;

    Object.keys(update).forEach(function (key) {
      var sourceValue = update[key];
      var targetValue = output[key];
      if (isObject(sourceValue) && isObject(targetValue)) {
        output[key] = deepMerge(targetValue, sourceValue);
      } else {
        output[key] = sourceValue;
      }
    });
    return output;
  }

  function normalizeBoolean(value, fallbackValue) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
    return fallbackValue;
  }

  function normalizeOptions(input) {
    var merged = deepMerge(DEFAULTS, input || {});
    merged.closeOnEsc = normalizeBoolean(merged.closeOnEsc, DEFAULTS.closeOnEsc);
    merged.allowFullscreen = normalizeBoolean(merged.allowFullscreen, DEFAULTS.allowFullscreen);
    merged.mode = String(merged.mode || DEFAULTS.mode).toLowerCase();
    if (merged.mode !== "inline" && merged.mode !== "modal") {
      merged.mode = "inline";
    }
    merged.flow = String(merged.flow || DEFAULTS.flow).toLowerCase();
    if (merged.flow !== "test" && merged.flow !== "assignment") {
      merged.flow = "test";
    }
    return merged;
  }

  function setDeepProperty(target, dottedPath, value) {
    var pathParts = dottedPath.split(".");
    var cursor = target;
    for (var i = 0; i < pathParts.length - 1; i++) {
      var segment = pathParts[i];
      if (!isObject(cursor[segment])) {
        cursor[segment] = {};
      }
      cursor = cursor[segment];
    }
    cursor[pathParts[pathParts.length - 1]] = value;
  }

  function parseAttributes(element) {
    var parsed = {};
    Object.keys(ATTRIBUTE_MAP).forEach(function (attributeName) {
      if (!element.hasAttribute(attributeName)) return;
      var value = element.getAttribute(attributeName);
      if (value === null) return;
      setDeepProperty(parsed, ATTRIBUTE_MAP[attributeName], value);
    });
    return parsed;
  }

  function ensureBaseUrl(baseUrl) {
    if (!baseUrl || typeof baseUrl !== "string") {
      throw new Error("AMTestingEmbed: 'baseUrl' is required.");
    }
    return baseUrl.replace(/\/+$/, "");
  }

  function buildPath(config) {
    if (config.endpoint) {
      return config.endpoint.charAt(0) === "/" ? config.endpoint : "/" + config.endpoint;
    }
    if (config.flow === "assignment") {
      if (!config.assignmentId) {
        throw new Error("AMTestingEmbed: 'assignmentId' is required when flow='assignment'.");
      }
      return "/student-dashboard/take-assignment/" + encodeURIComponent(config.assignmentId);
    }
    if (!config.testId) {
      throw new Error("AMTestingEmbed: 'testId' is required when flow='test'.");
    }
    return "/student-dashboard/take-test/" + encodeURIComponent(config.testId);
  }

  function buildIframeUrl(config) {
    var baseUrl = ensureBaseUrl(config.baseUrl);
    var path = buildPath(config);
    var url = new URL(path, baseUrl);

    var query = deepMerge(config.query || {}, {
      embed: "1",
      locale: config.locale,
      embed_theme_primary: config.theme.primaryColor,
      embed_theme_accent: config.theme.accentColor,
      embed_theme_bg: config.theme.backgroundColor,
      embed_theme_text: config.theme.textColor,
      embed_theme_radius: config.theme.borderRadius,
      embed_theme_font: config.theme.fontFamily,
      embed_mode: config.mode,
    });

    Object.keys(query).forEach(function (key) {
      if (query[key] === undefined || query[key] === null || query[key] === "") return;
      url.searchParams.set(key, String(query[key]));
    });

    return url.toString();
  }

  function emit(widget, type, detail) {
    var eventName = "am-testing:" + type;
    var eventPayload = detail || {};

    widget.dispatchEvent(
      new CustomEvent(eventName, {
        detail: eventPayload,
        bubbles: true,
      })
    );

    var callbackNameMap = {
      ready: "onReady",
      complete: "onComplete",
      exit: "onExit",
      error: "onError",
    };

    var callbackName = callbackNameMap[type];
    var callback = widget._config && widget._config.events ? widget._config.events[callbackName] : null;
    if (typeof callback === "function") {
      try {
        callback(eventPayload);
      } catch (callbackError) {
        console.error("AMTestingEmbed callback error:", callbackError);
      }
    }
  }

  function getOrigin(baseUrl) {
    try {
      return new URL(baseUrl).origin;
    } catch (error) {
      return "";
    }
  }

  function buildStyle(config) {
    var t = config.theme;
    return (
      ":host{" +
      "display:block;" +
      "font-family:" + t.fontFamily + ";" +
      "color:" + t.textColor + ";" +
      "}" +
      ".am-root{" +
      "--am-primary:" + t.primaryColor + ";" +
      "--am-accent:" + t.accentColor + ";" +
      "--am-bg:" + t.backgroundColor + ";" +
      "--am-text:" + t.textColor + ";" +
      "--am-radius:" + t.borderRadius + ";" +
      "--am-font:" + t.fontFamily + ";" +
      "font-family:var(--am-font);" +
      "color:var(--am-text);" +
      "}" +
      ".am-frame{" +
      "display:block;" +
      "width:100%;" +
      "height:100%;" +
      "border:0;" +
      "border-radius:var(--am-radius);" +
      "background:var(--am-bg);" +
      "}" +
      ".am-inline{" +
      "width:" + config.width + ";" +
      "height:" + config.height + ";" +
      "max-width:100%;" +
      "}" +
      ".am-launch{" +
      "appearance:none;" +
      "cursor:pointer;" +
      "border:0;" +
      "padding:12px 18px;" +
      "font:600 14px/1 var(--am-font);" +
      "border-radius:var(--am-radius);" +
      "background:var(--am-primary);" +
      "color:#fff;" +
      "}" +
      ".am-overlay{" +
      "position:fixed;" +
      "inset:0;" +
      "background:rgba(0,0,0,0.55);" +
      "display:none;" +
      "z-index:999999;" +
      "}" +
      ".am-overlay[data-open='true']{" +
      "display:block;" +
      "}" +
      ".am-modal{" +
      "position:absolute;" +
      "left:50%;" +
      "top:50%;" +
      "transform:translate(-50%,-50%);" +
      "width:min(1200px,94vw);" +
      "height:min(860px,90vh);" +
      "background:var(--am-bg);" +
      "border-radius:var(--am-radius);" +
      "box-shadow:0 20px 60px rgba(0,0,0,0.3);" +
      "overflow:hidden;" +
      "display:flex;" +
      "flex-direction:column;" +
      "}" +
      ".am-modal-header{" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:space-between;" +
      "padding:10px 14px;" +
      "background:var(--am-accent);" +
      "color:#fff;" +
      "font:600 14px/1 var(--am-font);" +
      "}" +
      ".am-close{" +
      "appearance:none;" +
      "border:0;" +
      "width:30px;" +
      "height:30px;" +
      "border-radius:999px;" +
      "cursor:pointer;" +
      "font-size:18px;" +
      "line-height:1;" +
      "background:rgba(255,255,255,0.15);" +
      "color:#fff;" +
      "}" +
      ".am-modal-body{" +
      "flex:1;" +
      "min-height:0;" +
      "}" +
      ".am-error{" +
      "border:1px solid #fecaca;" +
      "background:#fef2f2;" +
      "color:#991b1b;" +
      "padding:12px;" +
      "border-radius:10px;" +
      "font:500 13px/1.4 var(--am-font);" +
      "}" +
      (config.customCss || "")
    );
  }

  function createIframe(config, src) {
    var frame = document.createElement("iframe");
    frame.className = "am-frame";
    frame.src = src;
    frame.setAttribute("allow", "clipboard-read; clipboard-write; fullscreen");
    if (config.allowFullscreen) {
      frame.setAttribute("allowfullscreen", "true");
    }
    return frame;
  }

  class AMTestingWidget extends HTMLElement {
    static get observedAttributes() {
      return Object.keys(ATTRIBUTE_MAP);
    }

    constructor() {
      super();
      this._config = normalizeOptions();
      this._iframe = null;
      this._overlay = null;
      this._isOpen = false;
      this._onMessage = this._handleMessage.bind(this);
      this._onEsc = this._handleEsc.bind(this);
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      var configFromAttributes = parseAttributes(this);
      this.mount(configFromAttributes);
    }

    disconnectedCallback() {
      this.destroy();
    }

    attributeChangedCallback() {
      if (!this.isConnected) return;
      var configFromAttributes = parseAttributes(this);
      this.update(configFromAttributes);
    }

    mount(config) {
      this._config = normalizeOptions(deepMerge(this._config || DEFAULTS, config || {}));
      this._render();
      return this;
    }

    update(config) {
      this._config = normalizeOptions(deepMerge(this._config || DEFAULTS, config || {}));
      this._render();
      return this;
    }

    destroy() {
      this._isOpen = false;
      this._iframe = null;
      this._overlay = null;
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = "";
      }
      global.removeEventListener("message", this._onMessage);
      global.removeEventListener("keydown", this._onEsc);
    }

    open() {
      if (this._config.mode !== "modal" || !this._overlay) return;
      this._overlay.setAttribute("data-open", "true");
      this._isOpen = true;
      emit(this, "ready", { source: "open" });
    }

    close() {
      if (this._config.mode !== "modal" || !this._overlay) return;
      this._overlay.setAttribute("data-open", "false");
      this._isOpen = false;
      emit(this, "exit", { source: "close" });
    }

    _renderError(errorMessage) {
      if (!this.shadowRoot) return;
      this.shadowRoot.innerHTML =
        "<div class='am-root'>" +
        "<style>" + buildStyle(this._config) + "</style>" +
        "<div class='am-error'>" + errorMessage + "</div>" +
        "</div>";
      emit(this, "error", { message: errorMessage });
    }

    _render() {
      if (!this.shadowRoot) return;

      var src = "";
      try {
        src = buildIframeUrl(this._config);
      } catch (error) {
        this._renderError(error.message || "Unable to configure testing widget.");
        return;
      }

      global.removeEventListener("message", this._onMessage);
      global.removeEventListener("keydown", this._onEsc);

      var root = document.createElement("div");
      root.className = "am-root";

      var style = document.createElement("style");
      style.textContent = buildStyle(this._config);
      root.appendChild(style);

      if (this._config.mode === "modal") {
        var launchButton = document.createElement("button");
        launchButton.className = "am-launch";
        launchButton.type = "button";
        launchButton.textContent = this._config.launchText || "Start Test";

        var overlay = document.createElement("div");
        overlay.className = "am-overlay";
        overlay.setAttribute("data-open", "false");

        var modal = document.createElement("div");
        modal.className = "am-modal";

        var header = document.createElement("div");
        header.className = "am-modal-header";

        var title = document.createElement("span");
        title.textContent = this._config.title || "Testing";

        var closeButton = document.createElement("button");
        closeButton.className = "am-close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Close testing");
        closeButton.textContent = "×";

        header.appendChild(title);
        header.appendChild(closeButton);

        var body = document.createElement("div");
        body.className = "am-modal-body";

        var frame = createIframe(this._config, src);
        body.appendChild(frame);

        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);

        root.appendChild(launchButton);
        root.appendChild(overlay);

        this._iframe = frame;
        this._overlay = overlay;

        var self = this;
        launchButton.addEventListener("click", function () {
          self.open();
        });
        closeButton.addEventListener("click", function () {
          self.close();
        });
        overlay.addEventListener("click", function (event) {
          if (event.target === overlay) {
            self.close();
          }
        });
      } else {
        var inlineContainer = document.createElement("div");
        inlineContainer.className = "am-inline";

        var inlineFrame = createIframe(this._config, src);
        inlineContainer.appendChild(inlineFrame);
        root.appendChild(inlineContainer);

        this._iframe = inlineFrame;
        this._overlay = null;
      }

      this.shadowRoot.innerHTML = "";
      this.shadowRoot.appendChild(root);

      var selfRef = this;
      if (this._iframe) {
        this._iframe.addEventListener("load", function () {
          var baseOrigin = getOrigin(selfRef._config.baseUrl);
          if (selfRef._config.studentToken && selfRef._iframe && selfRef._iframe.contentWindow) {
            try {
              selfRef._iframe.contentWindow.postMessage(
                { type: "AM_TESTING_TOKEN", token: selfRef._config.studentToken },
                baseOrigin || "*"
              );
            } catch (error) {
              emit(selfRef, "error", {
                message: "Unable to send student token to iframe.",
                error: String(error),
              });
            }
          }
          emit(selfRef, "ready", { source: "iframe-load", src: selfRef._iframe.src });
        });
      }

      global.addEventListener("message", this._onMessage);
      global.addEventListener("keydown", this._onEsc);
    }

    _handleEsc(event) {
      if (this._config.mode !== "modal" || !this._isOpen || !this._config.closeOnEsc) return;
      if (event.key === "Escape") {
        this.close();
      }
    }

    _handleMessage(event) {
      if (!event || !event.data || typeof event.data !== "object") return;

      var allowedOrigin = getOrigin(this._config.baseUrl);
      if (allowedOrigin && event.origin !== allowedOrigin) return;

      var data = event.data;
      if (typeof data.type !== "string") return;

      if (data.type === "AM_TESTING_READY") {
        emit(this, "ready", data.payload || data);
        return;
      }
      if (data.type === "AM_TESTING_COMPLETE") {
        emit(this, "complete", data.payload || data);
        return;
      }
      if (data.type === "AM_TESTING_EXIT") {
        if (this._config.mode === "modal") this.close();
        emit(this, "exit", data.payload || data);
        return;
      }
      if (data.type === "AM_TESTING_ERROR") {
        emit(this, "error", data.payload || data);
      }
    }
  }

  if (!global.customElements.get("am-testing-widget")) {
    global.customElements.define("am-testing-widget", AMTestingWidget);
  }

  function resolveHost(target) {
    if (!target) throw new Error("AMTestingEmbed.mount: target is required.");
    if (typeof target === "string") {
      var node = document.querySelector(target);
      if (!node) {
        throw new Error("AMTestingEmbed.mount: target selector not found.");
      }
      return node;
    }
    return target;
  }

  function mount(target, options) {
    var host = resolveHost(target);
    if (host.tagName && host.tagName.toLowerCase() === "am-testing-widget") {
      host.mount(options || {});
      return host;
    }

    var existingWidget = host.__amTestingWidget;
    if (existingWidget) {
      existingWidget.update(options || {});
      return existingWidget;
    }

    host.innerHTML = "";
    var widget = document.createElement("am-testing-widget");
    host.appendChild(widget);
    widget.mount(options || {});
    host.__amTestingWidget = widget;
    return widget;
  }

  function unmount(target) {
    var host = resolveHost(target);
    if (host.tagName && host.tagName.toLowerCase() === "am-testing-widget") {
      host.destroy();
      host.remove();
      return;
    }
    if (host.__amTestingWidget) {
      host.__amTestingWidget.destroy();
      host.__amTestingWidget.remove();
      delete host.__amTestingWidget;
    }
    host.innerHTML = "";
  }

  function autoInit() {
    var targets = document.querySelectorAll("[data-am-testing='true']");
    targets.forEach(function (target) {
      if (target.__amTestingWidget) return;
      var options = {};
      if (target.dataset.baseUrl) options.baseUrl = target.dataset.baseUrl;
      if (target.dataset.flow) options.flow = target.dataset.flow;
      if (target.dataset.testId) options.testId = target.dataset.testId;
      if (target.dataset.assignmentId) options.assignmentId = target.dataset.assignmentId;
      if (target.dataset.mode) options.mode = target.dataset.mode;
      if (target.dataset.launchText) options.launchText = target.dataset.launchText;
      if (target.dataset.height) options.height = target.dataset.height;
      if (target.dataset.width) options.width = target.dataset.width;
      mount(target, options);
    });
  }

  global.AMTestingEmbed = {
    version: SDK_VERSION,
    defaults: DEFAULTS,
    mount: mount,
    unmount: unmount,
    autoInit: autoInit,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
})(window);
