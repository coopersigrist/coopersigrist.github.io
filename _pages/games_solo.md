---
layout: page
permalink: /games/solo/
title: Solo
nav: false
---

<p class="no-print"><a class="home-nav-btn game-reset" href="{{ '/games/' | relative_url }}">All games</a></p>

**Solo** is a trick-taking card game for 4–6 players using a 32-card deck (7–Ace). There is no single winner: the last player to reach 26 points is the loser. Hands are bid, then played with trump, partners, and “going through.”

I built the playable version in a separate Cursor project (`cooper-sigrist/Solo`). It is a **Next.js** app with its own **WebSocket room server**, so it cannot be dropped into this Jekyll site the way Asteroids can.

To put the live game on this page later, the clean options are:

1. **Host Solo separately and link or iframe it.** Deploy the UI (Vercel) and the room server (Railway/Fly), then point this Games card at that URL, or embed it in an iframe if you are fine with a full-screen game frame.
2. **Give Solo its own GitHub Pages project.** `coopersigrist.github.io/solo` (or a custom domain) keeps this academic site small and lets Solo keep Node and websockets.
3. **Copy a static export only if you add a local-only / AI mode.** The current architecture needs a long-lived WS process, which GitHub Pages cannot run.

Until one of those is live, this card stays as the landing page for the game.
