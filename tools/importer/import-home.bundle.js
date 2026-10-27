/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-split.js
  var CLIENTLIB = "https://www.euronpro.com/etc.clientlibs/euronpro/clientlibs/clientlib-loggedOutHome/resources/";
  var HERO_BG = `${CLIENTLIB}hero-content-background.png`;
  var SUBSCRIPTION_BG = `${CLIENTLIB}fingerprint.jpg`;
  function makeImg(document, src) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    return img;
  }
  function findBackground(document, container, fallbackUrl) {
    if (!container) return null;
    const direct = container.querySelector(":scope > img");
    if (direct) return direct;
    const view = document.defaultView || (typeof window !== "undefined" ? window : null);
    const candidates = [container, ...container.querySelectorAll(":scope > *")];
    for (const el of candidates) {
      const styles = [el.style && el.style.backgroundImage];
      if (view && view.getComputedStyle) {
        try {
          styles.push(view.getComputedStyle(el).backgroundImage);
          styles.push(view.getComputedStyle(el, "::before").backgroundImage);
        } catch (e) {
        }
      }
      for (const bg of styles) {
        const m = bg && bg.match(/url\(["']?([^"')]+)["']?\)/);
        if (m) return makeImg(document, m[1]);
      }
    }
    return fallbackUrl ? makeImg(document, fallbackUrl) : null;
  }
  function buildCta(document, a) {
    if (!a) return null;
    const label = a.querySelector(".cmp-button__text");
    const text = (label ? label.textContent : a.textContent).trim();
    if (!text) return null;
    const link = document.createElement("a");
    link.href = a.getAttribute("href") || "#";
    link.textContent = text;
    const p = document.createElement("p");
    p.append(link);
    return p;
  }
  function textOf(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function copyAs(document, tag, source) {
    const el = document.createElement(tag);
    el.innerHTML = source.innerHTML;
    return el;
  }
  function parse(element, { document }) {
    const cells = [];
    const content = [];
    let background = null;
    let sideImage = null;
    if (element.classList.contains("pc-subscriptionContainer")) {
      background = findBackground(document, element, SUBSCRIPTION_BG);
      const desc = element.querySelector(".pc-subscriptionContainer__descriptionContainer");
      if (desc) {
        const headline = desc.querySelector("p");
        if (headline && textOf(headline)) content.push(copyAs(document, "h2", headline));
        desc.querySelectorAll("a").forEach((a) => {
          const cta = buildCta(document, a);
          if (cta) content.push(cta);
        });
      }
      sideImage = element.querySelector(".pc-subscriptionContainer__image img");
    } else {
      const hero = element.closest(".pc-heroContent");
      background = findBackground(document, hero, HERO_BG);
      const textCol = element.querySelector(".pc-heroContent__textColumn") || element;
      const eyebrow = textCol.querySelector(".pc-heroContent__textColumn--title p");
      if (eyebrow && textOf(eyebrow)) content.push(copyAs(document, "p", eyebrow));
      const title = textCol.querySelector(".pc-heroContent__textColumn--subTitle p");
      if (title && textOf(title)) content.push(copyAs(document, "h1", title));
      const description = textCol.querySelector(".pc-heroContent__textColumn--description p");
      if (description && textOf(description)) content.push(copyAs(document, "p", description));
      textCol.querySelectorAll(".pc-heroContent__buttonWrapper a").forEach((a) => {
        const cta = buildCta(document, a);
        if (cta) content.push(cta);
      });
      sideImage = element.querySelector("img.pc-heroContent__imageWrapper--bannerDesktop");
    }
    if (background) cells.push([background]);
    if (sideImage) content.push(sideImage);
    cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-feature.js
  function parse2(element, { document }) {
    const cells = [];
    const items = element.querySelectorAll(".pc-heroContent__heroBulletWrapper--heroBullet");
    items.forEach((item) => {
      const icon = item.querySelector(".cmp-hero-bullet__icon img") || item.querySelector("img");
      const text = [...item.querySelectorAll(".cmp-richText p")].filter((p) => p.textContent.trim());
      if (!icon && !text.length) return;
      cells.push([icon || "", text]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-logos.js
  function parse3(element, { document }) {
    const cells = [];
    element.querySelectorAll(".cmp-image img").forEach((img) => {
      if (!img.getAttribute("src")) return;
      cells.push([img]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-logos", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-coverflow.js
  function parse4(element, { document }) {
    const cells = [];
    const slides = element.querySelectorAll(".swiper-wrapper > .swiper-slide:not(.swiper-slide-duplicate)");
    slides.forEach((slide) => {
      const img = slide.querySelector("img");
      const text = [];
      const heading = slide.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading && heading.textContent.trim()) {
        const h2 = document.createElement("h2");
        h2.textContent = heading.textContent.trim();
        text.push(h2);
      }
      slide.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) text.push(p);
      });
      slide.querySelectorAll("a[href]").forEach((a) => {
        if (!a.textContent.trim() || a.contains(img)) return;
        const p = document.createElement("p");
        p.append(a);
        text.push(p);
      });
      if (!img && !text.length) return;
      cells.push([img || "", text]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-coverflow", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-text.js
  function parse5(element, { document }) {
    const cells = [];
    const cards = element.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate) .cmp-card-item");
    cards.forEach((card) => {
      const content = [];
      const title = card.querySelector(".cmp-card-item__header h3");
      if (title && title.textContent.trim()) {
        const h3 = document.createElement("h3");
        h3.textContent = title.textContent.trim();
        content.push(h3);
      }
      const subtitle = card.querySelector(".cmp-card-item__header h4");
      if (subtitle && subtitle.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = subtitle.textContent.trim();
        content.push(p);
      }
      card.querySelectorAll(".cmp-card-item__content").forEach((desc) => {
        const text = desc.textContent.replace(/\s+/g, " ").trim();
        if (!text) return;
        const p = document.createElement("p");
        p.innerHTML = desc.innerHTML.trim();
        content.push(p);
      });
      if (content.length) cells.push([content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-text", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-divided.js
  function parse6(element, { document }) {
    const cells = [];
    const items = element.querySelectorAll(":scope > .cmp-accordion__item");
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title") || item.querySelector(".cmp-accordion__button");
      const question = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const panel = item.querySelector(".cmp-accordion__panel");
      let answer = [];
      if (panel) {
        answer = [...panel.querySelectorAll("p, ul, ol, h1, h2, h3, h4, h5, h6, table, img")].filter((el) => !el.parentElement.closest("p, ul, ol, table")).filter((el) => el.tagName === "IMG" || el.textContent.trim());
        if (!answer.length && panel.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = panel.textContent.replace(/\s+/g, " ").trim();
          answer = [p];
        }
      }
      if (!question && !answer.length) return;
      cells.push([question, answer]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-divided", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/euronpro-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment",
        ".cmp-experiencefragment--header",
        ".cmp-experiencefragment--sidebar-navigation",
        "#menuWrapper",
        ".pc-contactContainer__contactWrapper--contact footer.experiencefragment",
        ".pc-contactContainer__contactWrapper--contact .cmp-experiencefragment--footer",
        "footer.experiencefragment",
        ".cmp-experiencefragment--footer",
        "div.access-control",
        "div.pwa-install"
      ]);
      element.querySelectorAll("div.experiencefragment").forEach((el) => {
        if (!el.querySelector("img, p, h1, h2, h3, h4, h5, h6, a")) el.remove();
      });
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (/clarity\.ms|googleadservices|google\.com\/pagead/i.test(src)) {
          img.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        ".swiper-pagination",
        ".swiper-slide-shadow-left",
        ".swiper-slide-shadow-right",
        "button.arrow",
        "span.cmp-accordion__icon",
        "span.cmp-link__screen-reader-only"
      ]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "link",
        "script",
        "style",
        "meta",
        "noscript",
        "iframe"
      ]);
      element.querySelectorAll("[style]").forEach((el) => {
        el.style.removeProperty("background-image");
        el.style.removeProperty("background");
      });
      element.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        if (!h.textContent.replace(/ /g, " ").trim() && !h.querySelector("img")) h.remove();
      });
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (attr.name.startsWith("data-cmp-") || attr.name === "data-track" || attr.name.startsWith("data-analytics")) {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/euronpro-sections.js
  var MARKER = "data-excat-section-id";
  function findSection(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const document = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSection(element, section);
        if (!el) continue;
        if (i > 0 || section.style) {
          const hr = document.createElement("hr");
          if (section.style) hr.setAttribute(MARKER, section.id);
          if (i === 0) hr.setAttribute("data-excat-first", "true");
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        const anchor = findSection(element, section);
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        let placed = false;
        if (marker) {
          let next = marker.nextElementSibling;
          while (next && next.tagName !== "HR") next = next.nextElementSibling;
          if (next) {
            next.parentNode.insertBefore(metadata, next);
          } else if (anchor && anchor.parentNode) {
            anchor.after(metadata);
          } else {
            marker.parentNode.appendChild(metadata);
          }
          placed = true;
        }
        if (!placed && anchor && anchor.parentNode) anchor.after(metadata);
      }
      element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
      element.querySelectorAll("hr[data-excat-first]").forEach((hr) => hr.remove());
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
    "name": "home",
    "urls": [
      "https://www.euronpro.com"
    ],
    "representativeUrl": "https://www.euronpro.com",
    "description": "Euronpro home page: hero with feature bullets, partner logos, solutions coverflow carousel, sign-up banner, cardiometabolic update cards, FAQ accordion and contact band",
    "urlPattern": "/",
    "blocks": [
      {
        "name": "hero-split",
        "instances": [
          ".pc-heroContent__upperContent",
          ".pc-subscriptionContainer"
        ]
      },
      {
        "name": "cards-icon-feature",
        "instances": [
          ".pc-heroContent__heroBulletWrapper"
        ]
      },
      {
        "name": "cards-logos",
        "instances": [
          ".cmp-partner-container__logos"
        ]
      },
      {
        "name": "carousel-coverflow",
        "instances": [
          ".cmp-products-carousel"
        ]
      },
      {
        "name": "cards-text",
        "instances": [
          ".cmp-carousel-cards__wrapper"
        ]
      },
      {
        "name": "accordion-divided",
        "instances": [
          ".cmp-faq-container .cmp-accordion"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Hero",
        "selector": [
          ".herocontent",
          ".pc-heroContent"
        ],
        "style": null,
        "blocks": [
          "hero-split",
          "cards-icon-feature"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "Partnership logos",
        "selector": [
          ".partnercontainer",
          ".cmp-partner-container"
        ],
        "style": null,
        "blocks": [
          "cards-logos"
        ],
        "defaultContent": [
          ".cmp-partner-container__title"
        ]
      },
      {
        "id": "section-3",
        "name": "Solutions carousel",
        "selector": [
          ".productscontainer",
          ".cmp-products-container"
        ],
        "style": null,
        "blocks": [
          "carousel-coverflow"
        ],
        "defaultContent": [
          ".cmp-products-container__title"
        ]
      },
      {
        "id": "section-4",
        "name": "Subscription banner",
        "selector": [
          ".subscriptioncontainer",
          ".pc-subscriptionContainer"
        ],
        "style": null,
        "blocks": [
          "hero-split"
        ],
        "defaultContent": []
      },
      {
        "id": "section-5",
        "name": "Cardiometabolic updates",
        "selector": [
          ".carouselcards",
          ".cmp-carousel-cards"
        ],
        "style": null,
        "blocks": [
          "cards-text"
        ],
        "defaultContent": [
          ".cmp-carousel-cards__title"
        ]
      },
      {
        "id": "section-6",
        "name": "FAQ",
        "selector": [
          ".faqcontainer",
          ".cmp-faq-container"
        ],
        "style": null,
        "blocks": [
          "accordion-divided"
        ],
        "defaultContent": [
          ".cmp-faq-container__title"
        ]
      },
      {
        "id": "section-7",
        "name": "Contact",
        "selector": [
          ".contactcontainer",
          ".pc-contactContainer"
        ],
        "style": "mint",
        "blocks": [],
        "defaultContent": [
          ".pc-contactContainer__contactWrapper--info"
        ]
      }
    ]
  };
  var parsers = {
    "hero-split": parse,
    "cards-icon-feature": parse2,
    "cards-logos": parse3,
    "carousel-coverflow": parse4,
    "cards-text": parse5,
    "accordion-divided": parse6
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
