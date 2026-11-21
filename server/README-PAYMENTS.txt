TALANTA SPORTS CITY - DARAAJA BUY GOODS STK PUSH

1. Copy .env.example to .env inside this server folder.
2. Fill in your credentials locally. Never send .env to anyone or commit it.
3. Keep DARAJA_ENV=sandbox until Safaricom confirms production Go-Live approval and the Buy Goods routing values.
4. For Buy Goods STK, this integration sends:
   - TransactionType: CustomerBuyGoodsOnline
   - BusinessShortCode: approved Go-Live Store/Head Office shortcode
   - PartyB: customer-facing Till number
5. DARAJA_CALLBACK_URL must be publicly reachable over HTTPS and must include the same random DARAJA_CALLBACK_TOKEN in its query string.
6. Run from this folder: npm install, then npm start.
7. Health check: GET http://localhost:3000/api/health

IMPORTANT LIMITATIONS UNTIL MYSQL IS CONFIGURED
- Orders and payment state are stored in process memory only. Restarting the server loses them.
- The ticket price table in server.js mirrors the current demo prices in js/script.js. Update both deliberately until a database-backed price catalogue exists.
- A successful callback is reconciled with the STK Query API, but no ticket is issued yet.
- This is not ready for public production sales until persistent storage, real event/seat inventory, order ownership, reconciliation recovery, and end-to-end production tests are implemented.
