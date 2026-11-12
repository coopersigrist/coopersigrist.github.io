---
layout: page
permalink: /games/asteroids/
title: Asteroids
nav: false
---

Move with the mouse. Collect the bright photons and dodge the asteroids.

<canvas id="photon-game" width="960" height="420" aria-label="Asteroids game"></canvas>
<p class="game-status" id="photon-status">Score 0</p>
<p class="no-print"><a class="home-nav-btn game-reset" href="{{ '/games/' | relative_url }}">All games</a>
<button type="button" class="home-nav-btn game-reset" id="photon-reset">Play again</button></p>

<script defer src="{{ '/assets/js/games.js' | relative_url | bust_file_cache }}"></script>
