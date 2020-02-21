////////////////////////////////////////////////////////////////////////////////
// Copyright (C) 2017 by Miles Bradley Huff per LGPL3 (assets per CC-BY-SA-4) //
////////////////////////////////////////////////////////////////////////////////

// Resources
var graphics;
var sounds;

// Settings
var particleMultiplier;
var rockCollision;
var speedHack;
var useTextures;

// DOM variables
var canvas;
var context;

// Game variables
var gameInt;
var gameLoop;
var gameSecs;
var menuIndex;
var menuTimer;

// Scale variables
var height;
var halfHeight;
var halfWidth;
var width;
var bigAxis;

// Input variables
var downDown;
var leftDown;
var rightDown;
var spaceDown;
var upDown;
var menuShow;

// Fade variables
var monoFade;
var thrustFade;
var debrisFade;

// Star variables
var maxStarSize;
var starIVX;
var starIVY;
var stars;
var starSpeed;
var starCount;
var wantStars;

// Asteroid variables
var maxRockSize;
var maxRockSpeed;
var maxRockSpin;
var minRockSize;
var minRockSpeed;
var rockCD;
var rockCDnow;
var rockPoints;
var rocks = [];
var rockSpriteSize;
var rockCount;
var wantRocks;

// Missile variables
var shotCd;
var shots;
var shotCount;
var shotSize;
var shotHalfSize;
var shotHalfWidth;
var shotHalfHeight;
var shotWidth;
var shotHeight;

// Player variables
var player;
var shipFullThrust;
var shipHalfRealSize;
var shipMonoThrust;
var shipRealSize;
var shipSize;
var shipSpinThrust;
var thrustHeat;

// Particle variables
var particles;
var particleFade;
var particleSize;
var particleCount;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function new_rgba() {
	var rgba = {
		r: 127, // Red
		g: 127, // Green
		b: 127, // Blue
		a: 1.0  // Alpha
	};
	return rgba;
} //new_rgba()

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function new_particle() {
	var particle = {
		   x: 0,
		   y: 0,
		  vx: 0,
		  vy: 0,
		rgba: new_rgba(),
		type: 0  // debris:0::mono:1::thrust:2::shot:3
	};
	return particle;
} //new_particle()

////////////////////////////////////////////////////////////////////////////////

function new_star() {
	var star = {
		   r: 0, // Radius
		 dia: 0, // Diameter

		   x: 0, // Center x
		   y: 0, // Center y
		   z: 0, // Distance

		  vx: 0, // x-velocity
		  vy: 0, // y-velocity

		rgba: new_rgba()
	};

	// Generate more-or-less scientifically accurate star-data
	// I used https://en.wikipedia.org/wiki/Stellar_classification#Harvard_spectral_classification
	// to get the percentages, colors (RGB), luminosities (alpha), and sizes (radius).  As the
	// Wikipedia percentages did not add up to 100, I scaled them.  I also scaled the luminosities.
	star.rgba.a = Math.random();  // This is a temporary setting used to determine the stellar spectral class of the star
	         // Class M
	 if(star.rgba.a <= 0.765418272300) {
		star.rgba.r = 255;
		star.rgba.g = 189;
		star.rgba.b = 111;
		star.rgba.a = Math.round(    0.5   + (Math.random() * 0.027));  // 0.527 - 0.5
		star.r      = maxStarSize * (0     + (Math.random() * 0.7  ));  // 0.7   - 0
	} else   // Class K
	 if(star.rgba.a <= 0.886563610363) {
		star.rgba.r = 255;
		star.rgba.g = 221;
		star.rgba.b = 180;
		star.rgba.a = Math.round(    0.527 + (Math.random() * 0.2  ));  // 0.727 - 0.527
		star.r      = maxStarSize * (0.7   + (Math.random() * 0.26 ));  // 0.96  - 0.7
	} else   // Class G
	 if(star.rgba.a <= 0.962654897080) {
		star.rgba.r = 255;
		star.rgba.g = 244;
		star.rgba.b = 232;
		star.rgba.a = Math.round(    0.727 + (Math.random() * 0.273));  // 1     - 0.727
		star.r      = maxStarSize * (0.96  + (Math.random() * 0.19 ));  // 1.15  - 0.96
	} else   // Class F
	 if(star.rgba.a <= 0.992690931310) {
		star.rgba.r = 251;
		star.rgba.g = 248;
		star.rgba.b = 255;
		star.rgba.a =   1;
//		star.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
		star.r      = maxStarSize * (1.15  + (Math.random() * 0.25 ));  // 1.4   - 1.15
	} else   // Class A
	 if(star.rgba.a <= 0.998698138156) {
		star.rgba.r = 202;
		star.rgba.g = 216;
		star.rgba.b = 255;
		star.rgba.a =   1;
//		star.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
		star.r      = maxStarSize * (1.4   + (Math.random() * 0.4  ));  // 1.8   - 1.4
	} else   // Class B
	 if(star.rgba.a <= 0.999996996400) {
		star.rgba.r = 170;
		star.rgba.g = 191;
		star.rgba.b = 255;
		star.rgba.a =   1;
//		star.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
		star.r      = maxStarSize * (1.8   + (Math.random() * 4.8  ));  // 6.6   - 1.8
	} else { // Class O
		star.rgba.r = 155;
		star.rgba.g = 176;
		star.rgba.b = 255;
		star.rgba.a =   1;
//		star.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
		star.r      = maxStarSize *  6.6;
//		star.r      = maxStarSize * (6.6   + (Math.random() * 0    ));  // 6.6   - 6.6
	} //fi

	// Calculate star speed and apply distance to speed and luminosity
	star.z      = 6 * Math.random();
	star.vx     = star.z * starSpeed * starIVX;
	star.vy     = star.z * starSpeed * starIVY;
	star.r     *= star.z;
	star.dia    = star.r * 2;
	star.rgba.a*= star.z / 6;

	// 'Even' means we generate the star with a static x-axis
	if(Math.round(Math.random()) == 0) {
		if(!speedHack)
			 star.x = (bigAxis * -0.5) + (Math.random() * (bigAxis * 2.0));
		else star.x = Math.random() * (width + (2 * star.r));

		// 'Even' means we generate the star on the top
		if(Math.round(Math.random()) == 0) {
			if(!speedHack)
				 star.y = bigAxis * -0.5;
			else star.y = 0 - star.r;

		// 'Odd' means we generate the star on the bottom
		} else {
			if(!speedHack)
				 star.y = bigAxis * 1.5;
			else star.y = (height + star.r);
		} //fi

	// 'Odd' means we generate the star with a static y-axis
	} else {
		if(!speedHack)
			 star.y = (bigAxis * -0.5) + (Math.random() * (bigAxis * 2.0));
		else star.y = Math.random() * (height + (2 * star.r));

		// 'Even' means we generate the star on the left
		if(Math.round(Math.random()) == 0) {
			if(!speedHack)
				 star.x = bigAxis * -0.5;
			else star.x = (0 - star.r);

		// 'Odd' means we generate the star on the right
		} else {
			if(!speedHack)
				 star.x = bigAxis * 1.5;
			else star.x = (width + star.r);
		} //fi
	} //fi

	return star;
} //new_star()

////////////////////////////////////////////////////////////////////////////////

function new_ship() {
	var ship = {
		 h: 0,  // Heat
		vy: 0,  // Vertical velocity
		vd: 0,  // Rotational velocity, degrees
		vr: 0,  // Rotational velocity, radians
		cd: 0   // Missile cooldown timer
	};
	return ship;
} //new_ship()

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function new_player() {
	var player = {
		      score: 0,
		       ship: new_ship(),
//		 shotsFired: 0,
//		rocksBroken: 0,
//		 timePlayed: 0,
//		  timesDied: 0
	};
	return player;
} //new_player()

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function new_rock() {
	var rock = {
		   cx: 0,               // Center x
		   vx: 0,               // x-velocity
		    x: new Array(),     // xs

		   cy: 0,               // Center y
		   vy: 0,               // y-velocity
		    y: new Array(),     // ys

		    r: new Array(),     // Radiuses

		    d: 0,               // Facing
		   vd: 0,               // Spin

		irgba: new_rgba(), // Initial color
		 rgba: new_rgba()  // Color
	};

	// Generate color
	rock.irgba.r = 114 - (Math.random() * 3);
	rock.irgba.g = 111 - (Math.random() * 5);
	rock.irgba.b = 106 - (Math.random() * 7);

	// Calculate radiuses
	var rockSize = (minRockSize + (Math.random() * (maxRockSize - minRockSize)));
	var rockSizeThird = rockSize / 3;
	for(var j = 0; j < rockPoints; j++) {
		rock.r.push(rockSizeThird + (Math.random() * ((rockSizeThird * 2) - rockSizeThird)));
	} //done

	// Initialize coordinates
	for(var j = 0; j < rockPoints; j++) {
		rock.x.push(0);
		rock.y.push(0);
	} //done

	// Set velocities
	rock.vd = Math.random() * maxRockSpin;
	var offsetRockSpeed = maxRockSpeed - minRockSpeed;
	rock.vx = minRockSpeed + (Math.random() * offsetRockSpeed);
	rock.vy = minRockSpeed + (Math.random() * offsetRockSpeed);

	// Allow negative velocities
	if(Math.round(Math.random()) == 0)
		rock.vd*= -1;
	if(Math.round(Math.random()) == 0)
		rock.vx*= -1;
	if(Math.round(Math.random()) == 0)
		rock.vy*= -1;

	// Set positions
	rock.d = Math.random() * 360;
	// 'Even' means we generate the rock with a static y-axis
	if(Math.round(Math.random()) == 0) {
		rock.cx = Math.random() * (width + (2 * rockSize));

		// If the y-velocity is positive, start the rock on the top
		if(rock.vy + player.ship.vy > 0)
			 rock.cy = (0 - rockSize);

		// If the y-velocity is negative, start the rock on the bottom
		else rock.cy = (height + rockSize);

	// 'Odd' means we generate the rock with a static x-axis
	} else {
		rock.cy = Math.random() * (height + (2 * rockSize));

		// If the x-velocity is positive, start the rock on the left
		if(rock.vx > 0)
			 rock.cx = (0 - rockSize);

		// If the x-velocity is negative, start the rock on the right
		else rock.cx = (width + rockSize);
	} //fi

	return rock;
} //new_rock()

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function rocksplosion(rock) {

	// Figure out the size of the rock
	var avgSize = 0;
	for(var i = 0; i < rockPoints; i++) {
		avgSize+= rock.r[i];
	} //done
	avgSize/= rockPoints;
	var halfSize = avgSize;
	avgSize*= 2;

	// Create debris
	for(var i = 0; i < avgSize * particleMultiplier; i++) {
		var particle    = new_particle();
		particle.type   = 0;  // Debris
		particle.x      = (rock.cx - halfSize) + (Math.random() * avgSize);
		particle.y      = (rock.cy - halfSize) + (Math.random() * avgSize);
		particle.vx     = Math.random() * rock.vx * 2;
		particle.vy     = Math.random() * rock.vy * 2;
		particle.rgba   = rock.rgba;
//		particle.rgba.r = Math.round(particle.rgba.r * particle.rgba.a);
//		particle.rgba.g = Math.round(particle.rgba.g * particle.rgba.a);
//		particle.rgba.b = Math.round(particle.rgba.b * particle.rgba.a);
		particle.rgba.a = 1 - particle.rgba.a;
		particles.push(particle);
		particleCount++;
	} //done
} //rocksplosion()

////////////////////////////////////////////////////////////////////////////////

function shipsplosion(ship, rock) {
	for(var l = 0; l < shipRealSize * 2 * particleMultiplier; l++) {
		var particle = new_particle();
		particle.x   = (halfWidth  - shipHalfRealSize) + (Math.random() * shipRealSize);
		particle.y   = (halfHeight - shipHalfRealSize) + (Math.random() * shipRealSize);
		particle.vx  = Math.random() * rock.vx * 2;
		particle.vy  = Math.random() * (rock.vy - player.ship.vy);
		switch(Math.round(4 * Math.random())) {
			case 0: // Monopropellant
				particle.type   =   1;
				particle.rgba.r = 255;
				particle.rgba.g = 255;
				particle.rgba.b = 255;
				break;
			case 1: // Liquid fuel
				particle.type   =   2;
				particle.rgba.r = 255 - Math.round(      32 * Math.random() );
				particle.rgba.g = 127 + Math.round(32 - (64 * Math.random()));
				particle.rgba.b =       Math.round(      32 * Math.random() );
				break;
			case 2: // Grey structure
				particle.type   =   0;
				particle.rgba.r =  80;
				particle.rgba.g =  81;
				particle.rgba.b =  87;
				break;
			case 3: // Orange structure
				particle.type   =   0;
				particle.rgba.r =  70;
				particle.rgba.g =  45;
				particle.rgba.b =  25;
				break;
			case 4: // Solar Panels
				particle.type   =   0;
				particle.rgba.r =  17;
				particle.rgba.g =  21;
				particle.rgba.b =  26;
				break;
		} //esac
		particle.rgba.a = 1.0;
		//TODO:  Rotate the vector to match the ship's rotation
		particles.push(particle);
		particleCount++;
	} //done
} //shipsplosion()

////////////////////////////////////////////////////////////////////////////////

function new_shot() {
	var shot = {
		 x: 0, // x-coordinate
		 y: 0, // y-coordinate
		vx: 0, // x-velocity
		vy: 0, // y-velocity
		ax: 0, // x-acceleration
		ay: 0, // y-acceleration
		 d: 0  // rotation (in degrees)
	};

	// Center the shot under the ship
	shot.x  = halfWidth  - shotHalfSize;
	shot.y  = halfHeight - shotHalfSize;
	shot.ay = 2;

	return shot;
} //new_shot()

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function shotsplosion(shot, rock) {
	for(var l = 0; l < shipRealSize * 2 * particleMultiplier; l++) {
		var particle = new_particle();
		particle.x   = (halfWidth  - shotHalfWidth ) + (Math.random() * shotWidth );
		particle.y   = (halfHeight - shotHalfHeight) + (Math.random() * shotHeight);
		particle.vx  = Math.random() * (rock.vx - shot.vx);
		particle.vy  = Math.random() * (rock.vy - shot.vy);
		switch(Math.round(Math.random())) {
			case 0: // Liquid fuel
				particle.type = 3;
				particle.rgba.r = 255 - Math.round(      32 * Math.random() );
				particle.rgba.g = 127 + Math.round(32 - (64 * Math.random()));
				particle.rgba.b =       Math.round(      32 * Math.random() );
				break;
			case 1: // Structure
				particle.type = 0;
				particle.rgba.r =  49;
				particle.rgba.g =  49;
				particle.rgba.b =  47;
				break;
		} //esac
		particle.rgba.a = 1.0;
		particles.push(particle);
		particleCount++;
	} //done
} //shotsplosion()

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function event_keyDown(event) {
	switch(event.keyCode) {

		case 38:  // Up
		case 87:  // W
			if(menuIndex == 1)
				sounds.thrust.play();
			upDown = true;
			break;

		case 37:  // Left
		case 65:  // A
			if(menuIndex == 1)
				sounds.mono.play();
			leftDown = true;
			break;

		case 40:  // Down
		case 68:  // S
			if(menuIndex == 1)
				sounds.mono.play();
			downDown = true;
			break;

		case 39:  // Right
		case 83:  // D
			if(menuIndex == 1)
				sounds.mono.play();
			rightDown = true;
			break;

		case 13:  // Enter
		case 32:  // Space
			spaceDown = true;
	} //esac
} //event_keyDown()

////////////////////////////////////////////////////////////////////////////////

function event_keyUp(event) {
	switch(event.keyCode) {

		case 38:  // Up
		case 87:  // W
			sounds.thrust.pause();
			upDown = false;
			break;

		case 37:  // Left
		case 65:  // A
			if(!downDown && !rightDown)
				sounds.mono.pause();
			leftDown = false;
			break;

		case 40:  // Down
		case 68:  // S
			if(!leftDown && !rightDown)
				sounds.mono.pause();
			downDown = false;
			break;

		case 39:  // Right
		case 83:  // D
			if(!leftDown && !downDown)
				sounds.mono.pause();
			rightDown = false;
			break;

		case 13:  // Enter
		case 32:  // Space
			if(spaceDown == true) {
				switch(menuIndex) {
					case 2:  // Game over
						menuIndex = 0;
						player.score = 0;
						break;

					case 0:  // Main menu
						menuIndex = 1;
						player.ship.cd = shotCd;
						rocks.splice(0, rockCount);
						rockCount = 0;
						particles.splice(0, particleCount);
						particleCount = 0;
						shots.splice(0, shotCount);
						shotCount = 0;
						sounds.ship.play();
						menuIndex = 1;
						break;
				} //esac
			} //fi
			spaceDown = false;
	} //esac
} //event_keyUp()

////////////////////////////////////////////////////////////////////////////////

function project1_menuTimer() {
	if(menuShow) menuShow = false;
	else menuShow = true;
} //project1_menuTimer()

////////////////////////////////////////////////////////////////////////////////

function project1_gameLoop() {

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
	// Missiles

	for(var i = 0; i < shotCount; i++) {

		// Remove missiles when they leave the screen
		//TODO

		// Calculate missile vectors
		//TODO

		// Change missile position
		shots[i].vx+= shots[i].ax;
		shots[i].vy+= shots[i].ay;
		shots[i].x += shots[i].vx;
		shots[i].y += shots[i].vy;

		// Create particles
		//TODO

	} //done

	// Update missile cooldowns and fire new missiles
	if(spaceDown && player.ship.cd == 0) {
		sounds.shot.currentTime = 0;
//		sounds.shot.play();
		player.ship.cd = shotCd;
		shots.push(new_shot());
		shotCount++;
	} //fi

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

	if(!speedHack) {
		// Remove stars that are no longer reachable via rotation
		for(var i = 0; i < starCount; i++) {
			if(stars[i].x < 0 - bigAxis * 0.5
			|| stars[i].x >     bigAxis * 1.5
			|| stars[i].y < 0 - bigAxis * 0.5
			|| stars[i].y >     bigAxis * 1.5)
			{ //if
				stars.splice(i, 1);
				starCount--;
			} //fi
		} //done
	} else {
		// Remove stars that are no longer on the screen
		for(var i = 0; i < starCount; i++) {
			if(stars[i].x < 0      - stars[i].dia
			|| stars[i].x > width  + stars[i].dia
			|| stars[i].y < 0      - stars[i].dia
			|| stars[i].y > height + stars[i].dia)
			{ //if
				stars.splice(i, 1);
				starCount--;
			} //fi
		} //done
	} //fi

	// Add stars if there aren't enough
	while(starCount < wantStars) {
				stars.push(new_star());
				starCount++;
	} //done

	// Apply velocity
	for(var i = 0; i < starCount; i++) {
		stars[i].x+= stars[i].vx;
		stars[i].y+= stars[i].vy;
	} //done

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

	if(!speedHack) {
		// Remove asteroids when they are no longer reachable via rotation
		for(var i = 0; i < rockCount; i++) {
			if(rocks[i].cx < 0      - maxRockSize / 2
			|| rocks[i].cx > width  + maxRockSize / 2
			|| rocks[i].cy < 0      - maxRockSize / 2
			|| rocks[i].cy > height + maxRockSize / 2)
			{ //if
				rocks.splice(i, 1);
				rockCount--;
			} //fi
		} //done
	} else {
		// Remove asteroids when they leave the screen
		for(var i = 0; i < rockCount; i++) {
			if(rocks[i].cx < 0      - maxRockSize / 2
			|| rocks[i].cx > width  + maxRockSize / 2
			|| rocks[i].cy < 0      - maxRockSize / 2
			|| rocks[i].cy > height + maxRockSize / 2)
			{ //if
				rocks.splice(i, 1);
				rockCount--;
			} //fi
		} //done
	} //fi

	// Add asteroids if there aren't enough.  Never add more than 1/4 the desired asteroids at once.
	for(var i = 0; i < wantRocks / 4 && rockCount <  wantRocks; i++)
	{ //if
		// Set unconfigurable variables
		rocks.push(new_rock());
		rockCount++;
	} //fi

	// Update asteroids
	for(var i = 0; i < rockCount; i++) {

		// Variables
		var newcx = rocks[i].cx;
		var newcy = rocks[i].cy;

		// Calculate and apply delta-v (more distant asteroids are slower)
		rocks[i].d+=  rocks[i].vd;
		newcx+= (rocks[i].vx / 2) + ((rocks[i].vx * ((wantRocks - i) / wantRocks)) / 2);
		newcy+= (rocks[i].vy / 2) + ((rocks[i].vy * ((wantRocks - i) / wantRocks)) / 2);

		// The center must be an int or else the texture freaks out
		if(useTextures) {
			if(newcx < rocks[i].cx)
				 rocks[i].cx = Math.floor(newcx);
			else rocks[i].cx = Math.ceil(newcx);
			if(newcy < rocks[i].cy)
				 rocks[i].cy = Math.floor(newcy);
			else rocks[i].cy = Math.ceil(newcy);
		} else {
			rocks[i].cx = newcx;
			rocks[i].cy = newcy;
		} //fi

		// Prevent overflows
		if(rocks[i].d >=  360) rocks[i].d-= 360;
		if(rocks[i].d <= -360) rocks[i].d+= 360;

		// Calculate asteroid points.  Overall size is influenced by asteroid index.
		for(var j = 0; j < rockPoints; j++) {
			//              Center         Angle formula                                  Rotation                           Radius           Resizing formula
			rocks[i].x[j] = rocks[i].cx + (Math.sin((j * ((Math.PI * 2) / rockPoints)) + (rocks[i].d * (Math.PI / 180)))) * (rocks[i].r[j] * (0.75 + ((wantRocks - i) / (wantRocks * 6))));
			rocks[i].y[j] = rocks[i].cy + (Math.cos((j * ((Math.PI * 2) / rockPoints)) + (rocks[i].d * (Math.PI / 180)))) * (rocks[i].r[j] * (0.75 + ((wantRocks - i) / (wantRocks * 6))));
		//	rocks[i].x[j] = Math.round(rocks[i].x[j]);  // The points must be ints
		//	rocks[i].y[j] = Math.round(rocks[i].y[j]);  // The points must be ints
		} //done

		// Apply shading per asteroid index
		rocks[i].rgba.a = 0.50 * (i / wantRocks);
	} //done

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
	// Ship calculations
	if(menuIndex == 1) {

		// Calculate delta-V
		if(   upDown)
			player.ship.vy+= shipFullThrust;
		if( leftDown)
			player.ship.vd+= shipSpinThrust;
		if( downDown)
			player.ship.vy-= shipMonoThrust;
		if(rightDown)
			player.ship.vd-= shipSpinThrust;
		player.ship.vr = player.ship.vd * (Math.PI / 180);

		// Calculate heat
		if(upDown) {
			if(  player.ship.h < 1)
				 player.ship.h+= thrustHeat;
			else player.ship.h = 1;
		} else {
			if(  player.ship.h > thrustHeat)
				 player.ship.h-= thrustHeat;
			else player.ship.h = 0;
		} //fi

		// Create exhaust particles
		if(upDown) {
			for(var i = 0; i < 6 * particleMultiplier; i++) {
				var particle = new_particle();
				particle.type = 2;
				particle.x = (halfWidth  -  2) + (4 * Math.random());
				particle.y = (halfHeight + 15);
				particle.vx =  0;
				particle.vy = (2 + (4 * Math.random())) - player.ship.vy;
				particle.rgba.r = 255 - Math.round(      32 * Math.random() );
				particle.rgba.g = 127 + Math.round(32 - (64 * Math.random()));
				particle.rgba.b =       Math.round(      32 * Math.random() );
				particles.push(particle);
				particleCount++;
			} //done
		} //fi
		if(leftDown) {
			for(var i = 0; i < 3 * particleMultiplier; i++) {
				var particle = new_particle();
				particle.type = 1;
				particle.x = halfWidth  + 4;
				particle.y = halfHeight - 4;
				particle.vx =  0 + (4 * Math.random());
				particle.vy = (3 - (4 * Math.random())) - player.ship.vy;
				particle.rgba.r = 255;
				particle.rgba.g = 255;
				particle.rgba.b = 255;
				particles.push(particle);
				particleCount++;
			} //done
		} //fi
		if(downDown) {
			for(var i = 0; i < 3 * particleMultiplier; i++) {
				var particle = new_particle();
				particle.type = 1;
				particle.x = halfWidth;
				particle.y = halfHeight - 4;
				particle.vx =   2 - (4 * Math.random());
				particle.vy = (-2 - (4 * Math.random())) - player.ship.vy;
				particle.rgba.r = 255;
				particle.rgba.g = 255;
				particle.rgba.b = 255;
				particles.push(particle);
				particleCount++;
			} //done
		} //fi
		if(rightDown) {
			for(var i = 0; i < 3 * particleMultiplier; i++) {
				var particle = new_particle();
				particle.type = 1;
				particle.x = halfWidth  - 4;
				particle.y = halfHeight - 4;
				particle.vx =  0 - (4 * Math.random());
				particle.vy = (3 - (4 * Math.random())) - player.ship.vy;
				particle.rgba.r = 255;
				particle.rgba.g = 255;
				particle.rgba.b = 255;
				particles.push(particle);
				particleCount++;
			} //done
		} //fi
	} //fi

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
	// Particle physics

	// Remove invisible particles
	for(var i = 0; i < particleCount; i++) {
		if(particles[i].rgba.a < 0.05) {
			particles.splice(i, 1);
			particleCount--;
		} //fi
	} //done

	// Remove off-screen particles
	for(var i = 0; i < particleCount; i++) {
		if(particles[i].x < 0
		|| particles[i].x > width
		|| particles[i].y < 0
		|| particles[i].y > height)
		{ //if
			particles.splice(i, 1);
			particleCount--;
		} //fi
	} //done

	// Calculate particle positions
	for(var i = 0; i < particleCount; i++) {
		particles[i].x+= particles[i].vx;
		particles[i].y+= particles[i].vy;
	} //done

	// Calculate particle alphas
	for(var i = 0; i < particleCount; i++) {
		switch(particles[i].type) {

			case 0:
				particles[i].rgba.a*= debrisFade;
				break;

			case 1:
				particles[i].rgba.a*= monoFade;
				break;

			case 2:
			case 3:
				particles[i].rgba.a*= thrustFade;
				break;

			default:
				particles[i].rgba.a*= debrisFade;
				break;
		} //esac
	} //done

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
	// Apply rotation

	if(menuIndex == 1) {
		// Particles
		for(var i = 0; i < particleCount; i++) {

			// Calculate new positions
			var hypotenuse = Math.sqrt(Math.pow(particles[i].x - halfWidth, 2) + Math.pow(particles[i].y - halfHeight, 2));
			var radians    = Math.atan2(particles[i].y - halfHeight, particles[i].x - halfWidth) + player.ship.vr;
			particles[i].x = halfWidth  + (hypotenuse * Math.cos(radians + player.ship.vr));
			particles[i].y = halfHeight + (hypotenuse * Math.sin(radians + player.ship.vr));

			// Calculate new vectors
			hypotenuse = Math.sqrt(Math.pow(particles[i].vx, 2) + Math.pow(particles[i].vy, 2));
			radians    = Math.atan2(particles[i].vy, particles[i].vx) + player.ship.vr;
			var cos    = Math.cos(radians);
			var sin    = Math.sin(radians);
//			particles[i].vx = (particles[i].vx * cos) - (particles[i].vy * sin);
//			particles[i].vy = (particles[i].vx * sin) + (particles[i].vy * cos);

		} //done

		// Asteroids
		for(var i = 0; i < rockCount; i++) {

			// Calculate new positions
			var hypotenuse = Math.sqrt(Math.pow(rocks[i].cx - halfWidth, 2) + Math.pow(rocks[i].cy - halfHeight, 2));
			var radians    = Math.atan2(rocks[i].cy - halfHeight, rocks[i].cx - halfWidth) + player.ship.vr;
			rocks[i].cx    = halfWidth  + (hypotenuse * Math.cos(radians));
			rocks[i].cy    = halfHeight + (hypotenuse * Math.sin(radians));

			// Calculate new rotations
			//TODO:  This isn't accurate.
			rocks[i].d-= player.ship.vd;

			// Calculate new vectors
			hypotenuse  = Math.sqrt(Math.pow(rocks[i].vx, 2) + Math.pow(rocks[i].vy, 2));
			radians     = Math.atan2(rocks[i].vy, rocks[i].vx) + player.ship.vr;
			var cos     = Math.cos(radians);
			var sin     = Math.sin(radians);
//			rocks[i].vx = (rocks[i].vx * cos) - (rocks[i].vy * sin);
//			rocks[i].vy = (rocks[i].vx * sin) + (rocks[i].vy * cos);

		} //done

		// Missiles
		for(var i = 0; i < shotCount; i++) {

			// Calculate new positions
			var hypotenuse  = Math.sqrt(Math.pow(shots[i].x - halfWidth, 2) + Math.pow(shots[i].y - halfHeight, 2));
			var radians     = Math.atan2(shots[i].y - halfHeight, shots[i].x - halfWidth) + player.ship.vr;
			shots[i].x      = halfWidth  + (hypotenuse * Math.cos(radians + player.ship.vr));
			shots[i].y      = halfHeight + (hypotenuse * Math.sin(radians + player.ship.vr));

			// Calculate new rotations
			//TODO:  This isn't accurate.
			shots[i].d-= player.ship.vd;

			// Calculate new vectors
			hypotenuse  = Math.sqrt(Math.pow(shots[i].vx, 2) + Math.pow(shots[i].vy, 2));
			radians     = Math.atan2(shots[i].vy, shots[i].vx) + player.ship.vr;
			var cos     = Math.cos(radians);
			var sin     = Math.sin(radians);
//			shots[i].vx = (shots[i].vx * cos) - (shots[i].vy * sin);
//			shots[i].vy = (shots[i].vx * sin) + (shots[i].vy * cos);

		} //done

		// Stars
		for(var i = 0; i < starCount; i++) {

			// Calculate new positions
			var hypotenuse  = Math.sqrt(Math.pow(stars[i].x - halfWidth, 2) + Math.pow(stars[i].y - halfHeight, 2));
			var radians     = Math.atan2(stars[i].y - halfHeight, stars[i].x - halfWidth) + player.ship.vr;
			stars[i].x      = halfWidth  + (hypotenuse * Math.cos(radians + player.ship.vr));
			stars[i].y      = halfHeight + (hypotenuse * Math.sin(radians + player.ship.vr));

			// Calculate new vectors
			hypotenuse  = Math.sqrt(Math.pow(stars[i].vx, 2) + Math.pow(stars[i].vy, 2));
			radians     = Math.atan2(stars[i].vy, stars[i].vx) + player.ship.vr;
			var cos     = Math.cos(radians);
			var sin     = Math.sin(radians);
//			stars[i].vx = (stars[i].vx * cos) - (stars[i].vy * sin);
//			stars[i].vy = (stars[i].vx * sin) + (stars[i].vy * cos);

		} //done

		// Apply delta-V
		for(var i = 0; i < starCount; i++) {
			stars[i].y+= stars[i].z * (player.ship.vy / 50);
		} //done
		for(var i = 0; i < shotCount; i++) {
			shots[i].y+= player.ship.vy;
		} //done
		for(var i = 0; i < rockCount; i++) {
			rocks[i].cy+= player.ship.vy;
		} //done
		for(var i = 0; i < particleCount; i++) {
			particles[i].y+= player.ship.vy;
		} //done
	} //fi

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
	// Collision

	// Calculate ship collisions
	if(menuIndex == 1) {
		// Vs particles
		for(var i = 0; i < particleCount; i++) {
			if(halfWidth  - shipHalfRealSize <= particles[i].x
			&& halfWidth  + shipHalfRealSize >= particles[i].x
			&& halfHeight - shipHalfRealSize <= particles[i].y
			&& halfHeight + shipHalfRealSize >= particles[i].y)
			{ //if
				if(particles[i].type == 0) {
					player.score++;
					particles.splice(i, 1);
					i--;
					particleCount--;
				} //fi
			} //fi
		} //done
	} //fi

	// Calculate asteroid collisions
	var rockOffset = rockCount / 3;
	for(var i = 0; i < rockCount; i++) {

		// Get the average size of the asteroid
		var avgSize1   = rocks[i].r[0];
		var smallSize1 = rocks[i].r[0];
		for(var j = 1; j < rockPoints; j++) {
			avgSize1+= rocks[i].r[j];
			if(rocks[i].r[j] < smallSize1)
				smallSize1 = rocks[i].r[j];
		} //done
		avgSize1/= rockPoints;
		var halfSize1 = avgSize1;
		avgSize1*= 2;

		// Vs particles
		for(var j = 0; j < particleCount; j++) {
			if(rocks[i].cx - smallSize1 <= particles[j].x
			&& rocks[i].cx + smallSize1 >= particles[j].x
			&& rocks[i].cy - smallSize1 <= particles[j].y
			&& rocks[i].cy + smallSize1 >= particles[j].y)
			{ //if
				particles.splice(j, 1);
				j--;
				particleCount--;
			} //fi
		} //done

		// Vs missiles
		for(var j = 0; j < shotCount; j++) {
            //TODO
        } //done

		// Vs rocks
		// The particles that result from this are computationally intensive, so I added a toggle.
		if(rockCollision) {
			for(var l = 0; l < rockCount; l++) {

				// Only rocks with similar z-axises should collide.
				if(l != i && !(l > i + rockOffset || l < i - rockOffset)) {

//					if(speedHack) {
						// Get the average size of the asteroid
						var avgSize2 = 0;
						for(var j = 0; j < rockPoints; j++) {
							avgSize2+= rocks[l].r[j];
						} //done
						avgSize2/= rockPoints;
						var halfSize2 = avgSize2;
						avgSize2*= 2;

						if(rocks[i]
						&& rocks[i].cx - halfSize1 <= rocks[l].cx + halfSize2
						&& rocks[i].cx + halfSize1 >= rocks[l].cx - halfSize2
						&& rocks[i].cy - halfSize1 <= rocks[l].cy + halfSize2
						&& rocks[i].cy + halfSize1 >= rocks[l].cy - halfSize2)
						{ //if
							rocksplosion(rocks[i]);
							rocksplosion(rocks[l]);
							if(i > l) {
								rocks.splice(i, 1);
								rocks.splice(l, 1);
							} else {
								rocks.splice(l, 1);
								rocks.splice(i, 1);
							} //fi
							i--;
							l--;
							rockCount-= 2;
						} //fi

//					// This way is technically accurate, but absolutely ridiculously computationally intensive.  My laptop can't run it.
//					} else {
//						for(var j = 0; j < rockPoints; j++) {
//							for(var k = 0; k < rockPoints; k++) {
//								for(var m = 0; m < rockPoints; m++) {
//									for(var n = 0; n < rockPoints; n++) {
//										if(rocks[i].x[j] <= rocks[l].x[m] && rocks[i].x[k] >= rocks[l].x[n]
//										&& rocks[i].x[j] >= rocks[l].x[m] && rocks[i].x[k] <= rocks[l].x[n]
//										&& rocks[i].y[j] <= rocks[l].y[m] && rocks[i].y[k] >= rocks[l].y[n]
//										&& rocks[i].y[j] >= rocks[l].y[m] && rocks[i].y[k] <= rocks[l].y[n])
//										{ //if
//											rocksplosion(rocks[i]);
//											rocksplosion(rocks[l]);
//											rocks.splice(i, 1);
//											rocks.splice(l, 1);
//											i-= 2;
//											rockCount-= 2;
//										} //fi
//									} //done
//								} //done
//							} //done
//						} //done
//					} //fi
				} //fi
			} //done
		} //fi
		// Vs ships
        var shipDead = false;
		if(menuIndex == 1 && rocks[i]) {
			for(var j = 0; j < rockPoints; j++) {
				for(var k = 0; k < rockPoints; k++) {
					if(rocks[i].x[j] <= halfWidth  + shipHalfRealSize && rocks[i].x[k] >= halfWidth  - shipHalfRealSize
					&& rocks[i].x[j] >= halfWidth  - shipHalfRealSize && rocks[i].x[k] <= halfWidth  + shipHalfRealSize
					&& rocks[i].y[j] <= halfHeight + shipHalfRealSize && rocks[i].y[k] >= halfHeight - shipHalfRealSize
					&& rocks[i].y[j] >= halfHeight - shipHalfRealSize && rocks[i].y[k] <= halfHeight + shipHalfRealSize)
					{ //if
						shipDead = true;
						sounds.boom.play();
						rocksplosion(rocks[i]);
						shipsplosion(player.ship, rocks[i]);
						rocks.splice(i, 1);
						i--;
						rockCount--;
						menuIndex = 2;
						sounds.shot.pause();
						sounds.shot.currentTime = 0;
						sounds.ship.pause();
						sounds.ship.currentTime = 0;
						sounds.mono.pause();
						sounds.mono.currentTime = 0;
						sounds.thrust.pause();
						sounds.thrust.currentTime = 0;
						player.ship = new_ship();
						break;
					} // fi
				} //done
				if(shipDead) break;
			} //done
		} //fi
		if(shipDead) break;
	} //done

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

	// Draw background (black)
	context.fillStyle = "rgba(0, 0, 0, 1)";
	context.rect(0, 0, width, height);
	context.fill();

	// Draw stars
	// This doesn't actually draw stars in order of distance.  I might make it do so, but it would slow down the game and not really result in a noticeable improvement in realism.
	for(var i = 0; i < starCount; i++) {
		// Only draw stars that are on the screen
		if(stars[i].x >= 0      - stars[i].r
		|| stars[i].x <= width  + stars[i].r
		|| stars[i].y >= 0      - stars[i].r
		|| stars[i].y <= height + stars[i].r)
		{ //if
			// Stars are really bright, so from our perspective, we can only see what color they are from their border.
			context.fillStyle = "rgba(255, 255, 255, " + stars[i].rgba.a.toString() + ")";
			context.strokeStyle = "rgba(" + stars[i].rgba.r.toString()
				                + ", "    + stars[i].rgba.g.toString()
				                + ", "    + stars[i].rgba.b.toString()
				                + ", "    + stars[i].rgba.a.toString()
				                + ")";
			context.beginPath();
			context.arc(stars[i].x, stars[i].y, stars[i].r, 0, 2 * Math.PI, false);
			context.closePath();
			context.fill();
			context.stroke();
		} //fi
	} //done

	// Draw missiles
	for(var i = 0; i < shotCount; i++) {
//		context.drawImage(
//			graphics.shot,                            // Image to use
//			0,                                        // x-origin (frame)
//			shotSize * Math.floor(360 - shots[i].d),  // y-origin (frame)
//			shotSize,                                 // width    (frame)
//			shotSize,                                 // height   (frame)
//			shots[i].x - shotHalfSize,                // x-origin (canvas)
//			shots[i].y - shotHalfSize,                // y-origin (canvas)
//			shotSize,                                 // width    (canvas)
//			shotSize                                  // height   (canvas)
//		);
//		context.drawImage(graphics.shot, shots[i].x, shots[i].y, shotSize, shotSize);
	} //done

	// Draw missile particles
	for(var i = 0; i < particleCount; i++) {
		if(particles[i].type == 3) {
			context.fillStyle = "rgba(" + particles[i].rgba.r.toString()
				              + ", "    + particles[i].rgba.g.toString()
				              + ", "    + particles[i].rgba.b.toString()
				              + ", "    + particles[i].rgba.a.toString()
				              + ")"
			context.beginPath();
			context.arc(particles[i].x, particles[i].y, particleSize, 0, 2 * Math.PI, false);
			context.closePath();
			context.fill();
		} //fi
	} //done

	// Draw spaceship
	if(menuIndex == 1) {
			context.drawImage(graphics.ship,    (width - shipSize) / 2, (height - shipSize) / 2, shipSize, shipSize);
			context.globalAlpha = player.ship.h;
			context.drawImage(graphics.shipHot, (width - shipSize) / 2, (height - shipSize) / 2, shipSize, shipSize);
			context.globalAlpha = 1;
	} //fi

	// Draw non-missile particles
	for(var i = 0; i < particleCount; i++) {
		if(particles[i].type != 3) {
			context.fillStyle = "rgba(" + particles[i].rgba.r.toString()
				              + ", "    + particles[i].rgba.g.toString()
				              + ", "    + particles[i].rgba.b.toString()
				              + ", "    + particles[i].rgba.a.toString()
				              + ")"
			context.beginPath();
			context.arc(particles[i].x, particles[i].y, particleSize, 0, 2 * Math.PI, false);
			context.closePath();
			context.fill();
		} //fi
	} //done

	// Draw asteroids
	context.strokeStyle = "rgba(0, 0, 0, 0.5)";  // Shadow
	for(var i = 0; i < rockCount; i++) {

		// Calculate spritesheet frame
		var degrees = rocks[i].d;
		if(degrees < 0) degrees += 360;

		// Set asteroid fill
		if(!useTextures) {
			context.fillStyle = "rgba(" + rocks[i].rgba.r.toString()
				               + ", "   + rocks[i].rgba.g.toString()
				               + ", "   + rocks[i].rgba.b.toString()
				               + ", 1)";
		} //fi

		// Draw asteroids
		if(useTextures)
			context.save();
		context.beginPath();
		var cx = 0;
		var cy = 0;
		for(var j = 0; j < rockPoints; j++) {
			if(j <= 0) {
				context.moveTo(rocks[i].x[j],
				               rocks[i].y[j]);
			} else {
				context.lineTo(rocks[i].x[j],
				               rocks[i].y[j]);
			} //fi
			cx+= rocks[i].x[j];
			cy+= rocks[i].y[j];
		} //done
		context.lineTo(rocks[i].x[0],
			           rocks[i].y[0]);
		cx = Math.round(cx / rockPoints);
		cy = Math.round(cy / rockPoints);
		context.closePath();
		if(useTextures) {
			context.clip();
			context.drawImage(
				graphics.rock,                               // Image to use
				0,                                           // x-origin (frame)
				rockSpriteSize * Math.floor(360 - degrees),  // y-origin (frame)
				rockSpriteSize,                              // width    (frame)
				rockSpriteSize,                              // height   (frame)
				rocks[i].cx - (maxRockSize / 2),             // x-origin (canvas)
				rocks[i].cy - (maxRockSize / 2),             // y-origin (canvas)
				maxRockSize,                                 // width    (canvas)
				maxRockSize                                  // height   (canvas)
			);
			context.restore();
		} //fi
		if(!useTextures)
			context.fill();
		context.fillStyle = "rgba(0, 0, 0, " + rocks[i].rgba.a.toString() + ')';
		context.fill();
		context.stroke();
	} //done

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

	// Draw GUI
	switch(menuIndex) {

		case 0:  // Main menu
			context.strokeStyle = "rgba(255, 255, 255, 255)";
			if(menuShow == true) {
				context.drawImage(graphics.menu11, 0, 0, width, height);
			} else {
				context.drawImage(graphics.menu10, 0, 0, width, height);
			} //fi
			sounds.ship.pause();  // Also handle music
			break;

		case 1:  // Game
			sounds.ship.play();  // Also handle music
			break;

		case 2:  // Game over
			if(menuShow == true) {
				context.drawImage(graphics.menu21, 0, 0, width, height);
			} else {
				context.drawImage(graphics.menu20, 0, 0, width, height);
			} //fi
			sounds.ship.pause();  // Also handle music
			break;
	} //esac

//	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
//	// Sounds
//	switch(menuIndex) {
//		case 1:
//			// Monopropellant
//			var soundCutOff = sounds.mono.duration - (gameInt / 500);
//			if(!downDown && !rightDown && !leftDown)
//				sounds.mono.pause();
//			if(downDown || rightDown || leftDown)
//				sounds.mono.play();
//			if(sounds.mono.currentTime  > soundCutOff)
//				sounds.mono.currentTime-= soundCutOff;
//			// Thruster
//			var soundCutOff = sounds.thrust.duration - (gameInt / 500);
//			if(!upDown)
//				sounds.thrust.pause();
//			if(upDown)
//				sounds.thrust.play();
//			if(sounds.thrust.currentTime  > soundCutOff)
//				sounds.thrust.currentTime-= soundCutOff;
//			// Ambience
//			var soundCutOff = sounds.ship.duration - (gameInt / 500);
//			if(sounds.ship.currentTime  > soundCutOff)
//				sounds.ship.currentTime-= soundCutOff;
//			break;
//		case 0:
//		case 2:
//			sounds.mono.pause();
//			sounds.mono.currentTime = 0;
//			sounds.thrust.pause();
//			sounds.thrust.currentTime = 0;
//	} //esac

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

	// Modify cooldown timers
	if(  player.ship.cd >= gameSecs)
		 player.ship.cd -= gameSecs;
	else player.ship.cd  = 0;

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

	// Check for memory corruption
	if(!speedHack) {
		if(particleCount < 0) particleCount = 0;
		if(rockCount     < 0) rockCount     = 0;
		if(shotCount     < 0) shotCount     = 0;
		if(starCount     < 0) starCount     = 0;
	} //fi

	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
	// Update scores
	if(menuIndex == 1) {
		// You gain points simply by staying alive.
		if(rockCollision) {
				if(particleMultiplier > 1)
					 player.score+= 1 / gameInt;
				else player.score+= 2 / gameInt;
		} else       player.score+= 4 / gameInt;
		document.getElementById("scoreSpan").innerHTML = Math.floor(player.score).toString();
	} //fi

} //project1_gameLoop()

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Settings

function slideParticles(value) {

	// Remove all particles if the multiplier is 0
	if(value == 0) {
		particles.splice(0, particleCount);
		particleCount = 0;
	} //fi

	// Set the new particle multiplier
	particleMultiplier = Math.pow(value, 2);

	// Update setting-label
	switch(value) {
		case 0:
			document.getElementById("particleSpan").innerHTML = "Off";
			break;
		case 1:
			document.getElementById("particleSpan").innerHTML = "Low";
			break;
		case 2:
			document.getElementById("particleSpan").innerHTML = "High";
			break;
	} //esac

} //slideParticles()

function slideStars(value) {

	// Speedhack
	if(!speedHack)
		 var mult = 768;
	else var mult = 256;

	// If we're decreasing the number of stars, delete all existing stars
	if(wantStars > mult * value) {
		stars.splice(0, wantStars);
		starCount = 0;
	} //fi

	// Set the new star limit to the value of the slider
	wantStars = mult * value;

    // Create new stars
    var star;
	if(!speedHack) {
		for(var i = starCount; i < wantStars; i++) {
			star = new_star();
			star.x = (bigAxis * -0.5) + (Math.random() * bigAxis * 2.0);
			star.y = (bigAxis * -0.5) + (Math.random() * bigAxis * 2.0);
			stars.push(star);
			starCount++;
		} //done
	} else {
		for(var i = starCount; i < wantStars; i++) {
			star = new_star();
			star.x = Math.random() * width;
			star.y = Math.random() * height;
			stars.push(star);
			starCount++;
		} //done
	} //fi

	// Update setting-label
	switch(value) {
		case 0:
			document.getElementById("starSpan").innerHTML = "Off";
			break;
		case 1:
			document.getElementById("starSpan").innerHTML = "Low";
			break;
		case 2:
			document.getElementById("starSpan").innerHTML = "Medium";
			break;
		case 3:
			document.getElementById("starSpan").innerHTML = "High";
			break;
	} //esac

} //slideStars()

function toggleTextures(checked) {
	useTextures = checked;
} //textureToggle()

function toggleRockCollision(checked) {
	rockCollision = checked;
	for(var i = 0; i < particleCount; i++) {
		if(particles[i].type == 0) {
			particles.splice(i, 1);
			i--;
			particleCount--;
		} //fi
	} //done
} //rockCollision()

function toggleSpeedHack(checked) {
	speedHack = checked;
	slideStars(document.getElementById("starSlider").value);
} //rockCollision()

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Infobox

function showPremise() {
	document.getElementById("instructions").style.display = "none";
	document.getElementById("settings").style.display = "none";  // Is most likely to be the previous screen, so should be done next-to-last.
	document.getElementById("premise").style.display = "block";  // Is being unhidden, so should be done last.
} //showPremise()

function showInstructions() {
	document.getElementById("settings").style.display = "none";
	document.getElementById("premise").style.display = "none";        // Is most likely to be the previous screen, so should be done next-to-last.
	document.getElementById("instructions").style.display = "block";  // Is being unhidden, so should be done last.
} //showInstructions()

function showSettings() {
	document.getElementById("premise").style.display = "none";
	document.getElementById("instructions").style.display = "none";  // Is most likely to be the previous screen, so should be done next-to-last.
	document.getElementById("settings").style.display = "block";     // Is being unhidden, so should be done last.
} //showSettings()

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function init() {

	// HTML
	showPremise();

	// Audio
	sounds = {
		  boom: new Audio("res/boom.ogg"),
		  mono: new Audio("res/mono.ogg"),
		  ship: new Audio("res/ship.ogg"),
		  shot: new Audio("res/shot.ogg"),
		thrust: new Audio("res/thrust.ogg")
	};
	sounds.mono.loop     = true;
	sounds.thrust.loop   = true;
	sounds.ship.loop     = true;
	sounds.boom.volume   = 1.0;
	sounds.mono.volume   = 0.5;
	sounds.thrust.volume = 0.5;

	// Graphics
	graphics = {
		rock:    new Image(),
		ship:    new Image(),
		shipHot: new Image(),
		shot:    new Image(),
		menu10:  new Image(),
		menu11:  new Image(),
		menu20:  new Image(),
		menu21:  new Image()
	};
	graphics.rock.src    = "res/rock.png";
	graphics.ship.src    = "res/ship.png";
	graphics.shipHot.src = "res/shiphot.png";
	graphics.shot.src    = "res/shot.png";
	graphics.menu10.src  = "res/menu(1, 0).png";
	graphics.menu11.src  = "res/menu(1, 1).png";
	graphics.menu20.src  = "res/menu(2, 0).png";
	graphics.menu21.src  = "res/menu(2, 1).png";

	// DOM Variables
	canvas    = document.getElementById("haxteroids");
	context   = canvas.getContext("2d");
	gameInt   = 1000 / 60;
	gameSecs  = gameInt / 1000;
	menuIndex =  0;

	// Scale variables
	height = canvas.height;
	width  = canvas.width;
	if(height > width)
		 bigAxis = height;
	else bigAxis = width;
	halfHeight = height / 2;
	halfWidth  = width  / 2;

	// Input variables
	downDown  = false;
	leftDown  = false;
	rightDown = false;
	spaceDown = false;
	upDown    = false;
	menuShow  = false;

	// Star variables
	maxStarSize = 0.05;
	starIVX     = 1.0 - (Math.random() * 2.0);
	starIVY     = 1.0 - (Math.random() * 2.0);
	stars       = new Array();
	starSpeed   = 0.1625;
	starCount   = 0;

	// Asteroid variables
	maxRockSize    = 128;
	maxRockSpeed   =   1.0;
	maxRockSpin    =   1.0;
	minRockSize    = maxRockSize  / 4;
	minRockSpeed   = maxRockSpeed / 4;
	rockPoints     =  11;  // Too many sides generates asteroids that are too spiky, and too few generates asteroids that are too alike.  Using a prime number helps prevent symmetry.
	rocks          = new Array();
	rockSpriteSize = 128;
	rockCount      =   0;
	wantRocks      =  16;

	// Missile variables
	shotCd       = sounds.shot.duration;  // Cooldown for missiles
	shots        = new Array();
	shotCount    =  0;
	shotSize     = 16;
	shotHalfSize = shotSize   / 2;

	// Player variables
	player           = new_player();
	shipFullThrust   =  0.0625;
	shipMonoThrust   =  0.03125;
	shipRealSize     = 30;
	shipHalfRealSize = shipRealSize / 2;
	shipSize         = 32;
	shipSpinThrust   =  0.0078125;
	thrustHeat       =  0.0125;

	// Particle variables
	particles     = new Array();
	monoFade      = 0.5;  // Multiplier
	thrustFade    = 0.67;  // Multiplier
	debrisFade    = 0.9999;  // Multiplier
	particleSize  = 1;
	particleCount = 0;

	// Settings
	slideParticles(document.getElementById("particleSlider").value);
	slideStars(document.getElementById("starSlider").value);
	toggleTextures(document.getElementById("texturesToggle").checked);
	toggleRockCollision(document.getElementById("rockCollisionToggle").checked);
	toggleSpeedHack(document.getElementById("speedHackToggle").checked);

	// Initialize asteroids
	for(var i = 0; i < (wantRocks / 2); i++) {
		// Create an asteroid
		var rock = new_rock();

		// Set coordinates
		rock.cx = Math.random() * width;
		rock.cy = Math.random() * height;

		// Fix speeds
		// I have no idea why this is necessary
		//rock.vx*= 2;
		//rock.vy*= 2;

		// Fix sizes
		// I have no idea why this is necessary
		for(var j = 0; j < rockPoints; j++) {
			rock.r[j]/= 2;
		} //done

		// Add the asteroids to the array
		rocks.push(rock);
		rockCount++;
	} //done

	// Install event-handlers
	canvas.tabIndex      = 1000;
	canvas.style.outline = "none";
	canvas.addEventListener("keydown", event_keyDown, true);
	canvas.addEventListener("keyup",   event_keyUp,   true);

	// Set timers
	gameLoop  = setInterval(project1_gameLoop,  gameInt);
	menuTimer = setInterval(project1_menuTimer, gameInt * 30);
} //init()
