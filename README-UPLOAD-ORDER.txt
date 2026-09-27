BARAMEEL RUN — NEW REPOSITORY / UPLOAD ORDER

1) Create a new GitHub repository. Keep it EMPTY (no README, no .gitignore needed).
2) Upload the ROOT files/folders from this package exactly as they are.
3) Then upload the 18 runner artwork files into /assets:
   screen02-brona.png
   screen02-chiller.png
   screen02-dreamer.png
   screen02-racer.png
   screen02-rookie.png
   screen02-skater.png
   screen03-brona.png
   screen03-chiller.png
   screen03-dreamer.png
   screen03-racer.png
   screen03-rookie.png
   screen03-skater.png
   screen04-brona.png
   screen04-chiller.png
   screen04-dreamer.png
   screen04-racer.png
   screen04-rookie.png
   screen04-skater.png
4) Do NOT rename those 18 files.
5) Collection masters go in:
   /assets/collections/collection01/masters/
   Exact names:
   image01-master.png ... image10-master.png
   The game does NOT require separate puzzle-piece image files; it crops the master into the 3x3 cells in the browser.
6) The 90 QR image files are already included in:
   /assets/collections/collection01/qr-codes/
   They correspond to image01..image10 x piece01..piece09.
7) Keep collection.json exactly where it is. It contains ALEXANDRIA, 10 images, 9 pieces/image, QR payloads, rarity, points and print quantities.
8) Screen artwork already included in this package is optimized WebP for fast loading:
   assets/screen01-start.webp
   assets/screen05-scanner.webp
   assets/screen04-rewards.webp
   assets/screen06-puzzle.webp
   Do not upload the old large PNG versions over these unless you intentionally want the heavier version.
9) GitHub Pages: Settings -> Pages -> Deploy from branch -> main -> /(root) -> Save.
10) Wait for Pages deployment, then open the root URL.
11) Test in this order: screen01 -> screen02 -> screen03 -> screen04 progress -> screen05 camera -> QR -> screen06 collections.

IMPORTANT:
- Do not upload an old app.js/styles.css/screen06.html over the new files.
- Do not create screens 07-10. Screen 04 is the progress/rewards home; Screen 05 is the scanner; Screen 06 is the collection.
- The final screen's NICE ONE button returns to screen05 to scan another QR.
- Screen06 only displays puzzle cells that have actually been collected.
- Bottom 10 image cards only reveal the individual 3x3 cells that have been collected.
- Completing all 9 pieces of an image triggers a full-art flash effect; no gold frame/ring is used.
- Reward points animate from 0 to the earned value, then pulse and settle.
