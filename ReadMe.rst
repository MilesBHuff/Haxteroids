ReadMe.rst
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

About
================================================================================

Summary
--------------------------------------------------------------------------------
| **General:**
| This game consists of a probe controlled by the player, missiles fired by the
  player (only partially implemented), randomly generated stars, randomly
  generated asteroids, particle-effects, and a webpage containing a backstory,
  instructions, and a control-panel for the graphical settings.
|
| **Code:**
| I wrote 100% of the code:  Javascript/TypeScript, HTML, CSS, and LISP.  I
  did not use any tutorials, although I did, of course, have to use Google,
  Stackexchange, etc to learn how to do certain things.  I also used Wikipedia
  for information regarding stars.
| I'm not a math person.  The last and highest math class I've taken, precalc,
  was in 2015, and I did mediocrely.  As a result, vectors are not rotated.
| The physics aren't completely realistic, even ignoring the lack of vector
  rotation.  However, they're a lot more realistic than the original asteroids
  game!  One of my original goals was having much more realistic physics, so
  mission accomplished.
| I have a "speedhack" option which disables certain computationally intensive
  behaviors, such as calculating more stars than fit on the screen.  These
  computations are necessary for rotation to be realistic.  With this speedhack
  enabled, the background stars will appear to form a circle when you are
  spinning rapidly.
| I made some optimizations to the code's algorithms, usually by very, very
  slightly increasing memory usage in order to drastically reduce CPU usage.
  There is still a *lot* of room for improvement.
| The code is both modularized and not modularized.  Generally speaking, only
  things which are called more than once are modularized.  As mentioned in the
  optimization bit, there is still room for improvement.
|
| **Hardware:**
| The laptop I originally used to program this was very slow, and quite old.
  The game's brightness was, accordingly, tuned for that laptop.  Unfortunately,
  every other computer out there seems to diplay the game as being much, much
  darker than my laptop did.  So be aware that the darkness was not intentional.
  However, be also aware that the darkness actually increases realism -- in
  real space, you would detect an asteroid not necessarily by what it reflects,
  but by what it occludes.
| The YouTube video was recorded on another computer because of the fact that
  my laptop can barely run this game on minimal settings.  I would say that an
  Intel i3 is the recommended specs, and that whatever ancient AMD processor I
  had in that laptop is close to the minimum specs.
|
| **Gameplay:**
| Unlike in the original Asteroids game, the ship stays in the center of the
  screen, while other things appear to move around it.  This allows the creation
  of a seemingly infinite universe.
| The only controls are movement.  Missiles are partially implemented.
| There is an exploit:  If you start out by spinning rapidly in either direction,
  you will never die.  This is because I don't know how to rotate vectors.
| Your score increases gradually the longer you survive.  The rate at which your
  score accumulates does not change.  Destroying an asteroid with a missile would
  have been worth 10 points, and launching a missile would have cost you 5
  points.  Your score is referred to as "research points", since the longer you
  stay alive, the more data the probe is able to collect.  Destroying an asteroid
  gets you the chance to look at its innards, and so is worth points.  Each
  missile you fire is one more missile you had to pay for before launching the
  probe, and so is that much less money you had left over to process your
  research, which means that many fewer research points you can earn.  Collecting
  space-debris increases your score by 1 per particle, as it presents additional
  data points for your research.  If you are playing with reduced particles, your
  score increases twice as quickly as the baseline;  and if you're playing without
  rock collisions, your score increases four times as quickly as the baseline.
  This is to allow slower computers to achieve comparable scores.
|
| **Missiles:**
| Missiles are only partially implemented, but you can't tell that this is the
  case while playing.  The assets are there, though!  I have a missile-dropping
  sound-effect (It turns out that if you modulate the amplitude of brown noise, it
  sounds like a crash;  and if you do it over a longer period of time, it sounds
  like a sliding gate of sorts;  and, so, I used that for the audio.), and I also
  have missile art (I based it on the Apache Hellfire missile).
|
| **Graphics:**
| All art was made from scratch by me.  I made the asteroid-textures in GIMP,
  and I hand-drew (in a GNU/Linux analogue to Microsoft Paint (Kolourpaint)) the
  probe (the player's ship) and the missile.
| The colors of the art were sampled from actual pictures of the things the art
  represents.  No, an RGB color can't be copyrighted.  Fun fact:  The orange
  center of the player's ship is sampled from the Orion moonlander.
| Rotation of art was done using a GIMP plugin I spent 18 hours writing in LISP.
| All other graphics are generated in Javascript.
|
| **Audio:**
| All sounds were generated completely from scratch using only Audacity, and all
  of them used only Audacity's generated brown-noise as their base.  I'm a
  freaking wizard.
| The "music" (ambiance) I'm classing separately from the sounds.  It plays in
  the background while you're playing the game, and simulates the sounds inside a
  spaceship, complete with radio-chatter.  The radio-chatter is actually a
  conversation between me and my dad about what he did outside that day.  I
  scrambled and distorted it, and threw in a couple samples of him and me saying
  radio codewords.  I generated the beeps using Audacity's sine-wave generator.
| Sound does not play when things that are not the ship collide with things that
  are not the ship.  That is because this is in space, and sound cannot travel in
  a vacuum.  In real space, you actually wouldn't even hear the monopropellant
  (since it's so quiet irl), but I couldn't bring myself to leave it out.
|
| **Stars:**
| The colors, sizes, luminosities, and frequency of appearance for the stars are
  all scientifically accurate, using information from Wikipedia.  The exact link
  is in the code;  but no content was used from Wikipedia.  I'm using the same
  license, anyway;  so even if I had used content from Wikipedia, it wouldn't be
  a legal issue.
| The stars have a random amount of parallax, reflected in their luminosity,
  size, speed, and acceleration relative to the player.  This results in a many-
  layered, essentially-3D parallax effect.
| Stars don't noticeably respond to your speed until you're moving at
  ridiculously fast speeds -- but they *do* respond!
|
| **Particles:**
| When objects, such as asteroids, the player's drone, and (had I kept working
  on it) missiles hit particles, the particles go away.
| Particles also decay away over time, with different kinds of particles doing
  so at different rates.
| The player's drone's nozzle heats up and emits black-box radiation (again,
  using realistic colors) depending on how long you accelerate forwards.  It
  also cools down when you are not accelerating.
| Monopropellant is used for movement in other directions.
| The player's probe, upon hitting an asteroid (or a missile, had I finished)
  explodes, emitting not only debris particles that match its colors, but also
  monopropellant and liquid fuel.
|
| **Asteroids:**
| Even the asteroids have parallax.  This is most noticeable when asteroid
  collision and textures are turned off in the settings.  The longer an asteroid
  is on the screen, the brighter, faster, and larger it gets.  This is a subtle
  effect, but makes the game continue to feel realistic even when asteroid
  collision is off.  Having the asteroids' characteristics vary per how long
  they've been on the screen makes it such that asteroids that are supposed to
  be further in the background never manage to appear on top of asteroids that
  are further in the foreground.  It also allows asteroids that are far in the
  background to safely pass below asteroids that are far in the foreground
  without the two touching.
| The shapes of the asteroids are randomly generated.
| The number of sides of each asteroid is 11.  11 was chosen instead of, *ie*,
  10 or 12, because prime numbers result in less identifiably regular asteroids.
  For example, allowing 12 sides make a Star of David asteroid much, much, much
  more likely.  Prime numbers maximise realisticness.
  11 was chosen instead of a smaller number, as smaller numbers allow for a much
  smaller variety of shapes.  11 was chosen instead of a larger number, as
  larger numbers create irregular spikeballs that look nothing like asteroids.
  Insanely high numbers create very laggy circles.
| Asteroids have a 1px "shadow" around them which makes it easier to tell which
  asteroid is on-top when two asteroids cross over each other.

Meta
--------------------------------------------------------------------------------
| **Author(s):**

* Miles B Huff

| **Date originally submitted:**  2017-02-22

License
--------------------------------------------------------------------------------
| Except where otherwise stated:

* Code is Copyright (C) to the author(s) per the terms of the GNU LGPL3
    ("GNU"'s Not UNIX Lesser General Public License v3).
* Non-code is Copyright (C) to the author(s) per the terms of the CC-BY-SA v4
    (Creative Commons Attribution-ShareAlike v4 International).

| The terms of these licenses can be found at /Licenses.txt.  Where there are
  exceptions, they will be noted in the directories or parent directories of the
  excepted files.

Usage
================================================================================
| Run `npm run build`.
| Open ./dist/incl/haxteroids.htm in your favorite evergreen browser.
| Once-upon-a-time, you could play this by visiting my school website:
  ``http://cobweb.cs.uga.edu/~huff/haxteroids.htm``.
