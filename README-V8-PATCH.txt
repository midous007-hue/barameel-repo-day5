BARAMEEL RUN — V8 precision patch

Apply these files OVER the currently working repository; do NOT delete your existing assets.
Changed: app.js, screen02.html, screen06.html, styles.css, register-sw.js, sw.js.
Added: screen07-rewards.html.

Key changes:
- Exact 3x3 collection image alignment against screen06 artwork.
- Thumbnail grids moved below the baked 1–10 number badges so numbers stay visibly in front.
- Full master image replaces the 3x3 separators at 9/9, with golden visual completion effect + sound.
- Points count-up extended to 2.2s with synchronized arcade counting sound and scale punch.
- Character selection keeps the same arcade motif but transposes the pitch per runner.
- Added SCAN MORE QR and MY REWARDS actions.
- Added screen07-rewards.html showing selected runner, lifetime points, weekly points and unique QR checkpoints.
- Explicit checkpoint tracking/backfill added to localStorage.
