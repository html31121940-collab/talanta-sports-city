TALANTA SPORTS CITY - PROJECT REVIEW BUILD

PROJECT STRUCTURE
- index.html: SPA entry point
- css/style.css: active stylesheet (backup copies retained)
- js/script.js: active frontend application and ticket checkout
- assets/: images, icons and fonts
- server/: Express backend and Daraja integration

PAYMENTS
- Buy Goods STK Push uses CustomerBuyGoodsOnline.
- See server/README-PAYMENTS.txt and server/.env.example.
- Copy server/.env.example to server/.env and fill values locally.
- Do not share server/.env or production credentials.
- Keep DARAJA_ENV=sandbox until Safaricom confirms the production Go-Live configuration.

RUN
1. Open a terminal in the server folder.
2. Run: npm install
3. Configure server/.env.
4. Run: npm start
5. Open http://localhost:3000

IMPORTANT
The MySQL database is intentionally not configured in this build, as requested.
Payment/order state is currently held in memory and is lost when the server restarts.
The current ticket prices mirror the demonstration prices in the frontend.
This build does not issue tickets yet. Complete database persistence, inventory,
reconciliation recovery, and end-to-end production tests before public sales.
