/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import cardsIconFeatureParser from './parsers/cards-icon-feature.js';
import cardsLogosParser from './parsers/cards-logos.js';
import carouselCoverflowParser from './parsers/carousel-coverflow.js';
import cardsTextParser from './parsers/cards-text.js';
import accordionDividedParser from './parsers/accordion-divided.js';
import cleanupTransformer from './transformers/euronpro-cleanup.js';
import sectionsTransformer from './transformers/euronpro-sections.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'hero-split': heroSplitParser,
  'cards-icon-feature': cardsIconFeatureParser,
  'cards-logos': cardsLogosParser,
  'carousel-coverflow': carouselCoverflowParser,
  'cards-text': cardsTextParser,
  'accordion-divided': accordionDividedParser,
};

const transformers = [cleanupTransformer, sectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
