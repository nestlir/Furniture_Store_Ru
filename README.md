# РУСЬ — Furniture Showroom & Commerce MVP

> Premium furniture storefront combining brand presentation, catalog browsing and a lightweight seller workflow.

[**Live project →**](https://github.com/nestlir/Furniture_Store_Ru)

## Product overview

«РУСЬ» is a premium showroom and e-commerce MVP for a furniture business in Sochi / Adler. The project combines a brand-led landing page with product discovery and a browser-based seller demo.

## Key capabilities

- premium editorial landing page;
- furniture catalog with search and categories;
- price filtering;
- product cards with dimensions, description and price;
- inquiry/cart flow for sending a product list to a manager;
- seller cabinet prototype using localStorage;
- Yandex Maps integration;
- SEO metadata, Open Graph and Schema.org `FurnitureStore`;
- responsive mobile/tablet/desktop layouts;
- GitHub Pages deployment through GitHub Actions.

## Product thinking

The experience deliberately treats the storefront as a brand as well as a catalog: visual atmosphere establishes trust first, while search, categories and product information provide the functional path to inquiry.

## Architecture

```text
Landing / Brand
      ↓
Catalog → Product cards → Inquiry
      ↓
Seller demo → localStorage
```

The seller cabinet is intentionally a static MVP. A production version would move authentication, inventory, image storage and order management to a backend/CMS.

## Stack

**HTML5 · CSS/SCSS · Vanilla JavaScript · Bootstrap Icons · Inter · EB Garamond · GitHub Actions · GitHub Pages**

## Run locally

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`.

## Context

Presented as a product/frontend case study demonstrating visual direction, responsive commerce UI, lightweight client-side state and deployment automation.
