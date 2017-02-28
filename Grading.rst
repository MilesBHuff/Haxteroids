Grading.rst
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Definition of Game Objects
================================================================================
| Asteroids, the player, the player's probe, missiles, particles, stars.
| And my pixel art is damned good.

Animation of Game Objects (Spritesheet)
================================================================================
| The asteroid texture is a moving spritesheet.  I generated it using my custom
  GIMP plugin.
| And my art is good.

Interaction between Game Objects
================================================================================
| There is collision between:

  + Asteroids and other asteroids (toggleable)
  + Asteroids and particles
  + Asteroids and the player's probe
  + Unimplemented:  Asteroids and missiles
  + The player's probe and asteroids
  + Unimplemented:  The player's probe and missiles

Keeping Score (or Achieving some Objective / Reaching some Destination)
================================================================================
| Acquire points by surviving, collecting particles, and destroying asteroids
  with missiles (missiles only partially implemented).

Complexity (Fixing Pong is the Baseline)
================================================================================
+ Over 2,000 lines of code between the game, the HTML, the CSS, and the GIMP
  plugin.
+ Over 120 hours dedicated to the assignment.
+ Particle effects.
+ Boatloads of parallax.
+ A procedurally generated universe.
+ Toggleable graphical settings.
+ Realistic, borderline 3D graphics.

| This is almost certainly and by far the most complicated project1 of anyone in
  the class.  It's more than safe to say that I nailed the complexity
  requirement.

Overall Look & Feel
================================================================================
| The game's graphical and audio assets were created on and optimized for a very
  old laptop.  As it turns out, the game appears much darker on everyone else's
  computer, and the thrusters don't sound nearly as cool.  But it's still very
  well-crafted and feels almost professional.
| The game runs at 60fps.  If it is laggy for you, you likely don't meet the
  recommended specs (you need to have at least an Intel i3 in order to play this
  game).  There are graphical settings that can be changed during the game if
  framerate is a problem for you.
| If you intend to spin rapidly in circles, the stars in the background will
  form a circle of their own.  You have to disable the speedhacks in order to
  fix this behaviour.  However, this comes at a significant cost to performance.
  Please see ``ReadMe.rst`` for more information.

Effectiveness of Personal Twist
================================================================================
| Personal twists:  (there are more than the below, but these are the main ones)

  + **Better physics:**  Although vastly improved over the original game, my
    physics are yet imperfect.  I'm not a very good mathematician, but I did my
    best.  See ``ReadMe.rst`` for more information.
    The original had friction in space, rocks went through each other, lasers
    had physical form...  Needless to say, it was *quite* unrealistic.
  + **Better graphics:**  I absolutely nailed this one.  My graphics are
    fantastic.  They aren't perfect, however, as the asteroid textures have a
    tendency to wobble.  This is a tradeoff of using floats.  Forcing the center
    coordinates for textured asteroids to be integers helped to mitigate the
    issue, but as the asteroids' sizes are still floats, this did not
    completely fix the issue, and this tweak comes at the cost of slightly less
    accurate asteroid movement.  Oh, and pretty much everything is parallaxed
    (the particles are an exception).
  + **Better sounds:**  My sounds are much more immersive than the original's,
    to say the least.
  + **Egocentric orientation:**  I wanted the ship to be piloted more as it
    would be in real life:  from the orientation of the ship itself.  Although
    this involved some complicated math and although I was not able to rotate
    vectors, this still paid off quite nicely, and allowed me to create the
    illusion of a limitless universe, instead of having to rely on border-
    wrapping like the original.
  + **More realistic scenario:**  In the original, you're in a trianglular ship
    in an arbitrary asteroid-field.  You are equipped with a laser-cannon, and
    gain points by shooting asteroids (of which there is a limited supply) and
    flying saucers.  
    In mine, you're in an orbital station remotely piloting a research probe
    through the Oort Cloud.  You only have one probe.  Your probe is
    realistically designed, and is loosely based off several real-life probes.
    There is no end to the asteroids, and there is no other life in-sight:  just
    you, and cold, empty space.
  + **More everything:**  My version of Asteroids has so little in-common with
    the original that almost everything in it could be considered a personal
    twist.  Even the absence of missiles is almost a personal twist.

Documentation
================================================================================
| I write extremely clean and extremely regular code, and include visual spacers
  and explanatory comments all throughout it.  It's even tabulated!
| The other documentation required for this project has all been provided.
| My gallery's got links to everything I've done in this class, and a link to it
  is included in ``ReadMe.rst``.

Demo/Gallery/YouTube
================================================================================
| By the time of the demo (Wednesday), I had a functional asteroid field
  consisting of randomly generated shapes, sizes, velocities.  I showed it to
  you.  I probably lost the sheet, because I'm an idiot.
| By the time of the demonstrations (Thursday), I had added parallax to the
  asteroids, as well as a rudimentary starfield in the background.  I showed
  this to you as well.
| I would love to show my work to the class, as I am quite proud of the results,
  even if I did not accomplish all I set out to.
| YouTube link:  https://youtu.be/6mNNUjJAHOU?list=PL3981E2447CEF026F
| Gallery link:  http://cobweb.cs.uga.edu/~huff/csci4070/gallery.htm
