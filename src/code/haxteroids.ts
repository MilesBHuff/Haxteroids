import { Particle, ParticleType } from "classes/particle.class";
import { RGBA } from "classes/rgba.class";
import { Ship } from "classes/ship.class";

////////////////////////////////////////////////////////////////////////////////
export class Haxteroids {

	// Resources
	private graphics: { [key: string]: HTMLImageElement; };
	private sounds: { [key: string]: HTMLAudioElement; };

	// Settings
	private particleMultiplier: number;
	private rockCollision: boolean;
	private speedHack: boolean;
	private useTextures: boolean;

	// DOM variables
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;

	// Game variables
	private gameInt: number;
	private gameLoop;
	private gameSecs: number;
	private menuIndex: number;
	private menuTimer;

	// Scale variables
	private height: number;
	private halfHeight: number;
	private halfWidth: number;
	private width: number;
	private bigAxis: number;

	// Input variables
	private downDown: boolean;
	private leftDown: boolean;
	private rightDown: boolean;
	private spaceDown: boolean;
	private upDown: boolean;
	private menuShow: boolean;

	// Fade variables
	private monoFade: number;
	private thrustFade: number;
	private debrisFade: number;

	// Star variables
	private maxStarSize: number;
	private starIVX: number;
	private starIVY: number;
	private stars: Array<any>;
	private starSpeed: number;
	private starCount: number;
	private wantStars: number;

	// Asteroid variables
	private maxRockSize: number;
	private maxRockSpeed: number;
	private maxRockSpin: number;
	private minRockSize: number;
	private minRockSpeed: number;
	private rockCD;
	private rockCDnow;
	private rockPoints: number;
	private rocks: Array<any>;
	private rockSpriteSize: number;
	private rockCount: number;
	private wantRocks: number;

	// Missile variables
	private shotCd;
	private shots: Array<any>;
	private shotCount: number;
	private shotSize: number;
	private shotHalfSize: number;
	private shotHalfWidth: number;
	private shotHalfHeight: number;
	private shotWidth: number;
	private shotHeight: number;

	// Player variables
	private player: { [key: string]: any; };
	private shipFullThrust: number;
	private shipHalfRealSize: number;
	private shipMonoThrust: number;
	private shipRealSize: number;
	private shipSize: number;
	private shipSpinThrust: number;
	private thrustHeat: number;

	// Particle variables
	private particles: Array<any>;
	private particleFade;
	private particleSize: number;
	private particleCount: number;

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////

	constructor() {

		// HTML
		this.showPremise();

		// Audio
		this.sounds = {
			boom: new Audio("res/boom.ogg"),
			mono: new Audio("res/mono.ogg"),
			ship: new Audio("res/ship.ogg"),
			shot: new Audio("res/shot.ogg"),
			thrust: new Audio("res/thrust.ogg")
		};
		this.sounds.mono.loop = true;
		this.sounds.thrust.loop = true;
		this.sounds.ship.loop = true;
		this.sounds.boom.volume = 1.0;
		this.sounds.mono.volume = 0.5;
		this.sounds.thrust.volume = 0.5;

		// Graphics
		this.graphics = {
			rock: new Image(),
			ship: new Image(),
			shipHot: new Image(),
			shot: new Image(),
			menu10: new Image(),
			menu11: new Image(),
			menu20: new Image(),
			menu21: new Image()
		};
		this.graphics.rock.src = "res/rock.png";
		this.graphics.ship.src = "res/ship.png";
		this.graphics.shipHot.src = "res/shiphot.png";
		this.graphics.shot.src = "res/shot.png";
		this.graphics.menu10.src = "res/menu(1, 0).png";
		this.graphics.menu11.src = "res/menu(1, 1).png";
		this.graphics.menu20.src = "res/menu(2, 0).png";
		this.graphics.menu21.src = "res/menu(2, 1).png";

		// DOM Variables
		this.canvas = document.getElementById("haxteroids") as HTMLCanvasElement;
		this.context = this.canvas.getContext("2d");
		this.gameInt = 1000 / 60;
		this.gameSecs = this.gameInt / 1000;
		this.menuIndex = 0;

		// Scale variables
		this.height = this.canvas.height;
		this.width = this.canvas.width;
		if (this.height > this.width)
			this.bigAxis = this.height;
		else this.bigAxis = this.width;
		this.halfHeight = this.height / 2;
		this.halfWidth = this.width / 2;

		// Input variables
		this.downDown = false;
		this.leftDown = false;
		this.rightDown = false;
		this.spaceDown = false;
		this.upDown = false;
		this.menuShow = false;

		// Star variables
		this.maxStarSize = 0.05;
		this.starIVX = 1.0 - (Math.random() * 2.0);
		this.starIVY = 1.0 - (Math.random() * 2.0);
		this.stars = new Array();
		this.starSpeed = 0.1625;
		this.starCount = 0;

		// Asteroid variables
		this.maxRockSize = 128;
		this.maxRockSpeed = 1.0;
		this.maxRockSpin = 1.0;
		this.minRockSize = this.maxRockSize / 4;
		this.minRockSpeed = this.maxRockSpeed / 4;
		this.rockPoints = 11;  // Too many sides generates asteroids that are too spiky, and too few generates asteroids that are too alike.  Using a prime number helps prevent symmetry.
		this.rocks = new Array();
		this.rockSpriteSize = 128;
		this.rockCount = 0;
		this.wantRocks = 16;

		// Missile variables
		this.shotCd = this.sounds.shot.duration;  // Cooldown for missiles
		this.shots = new Array();
		this.shotCount = 0;
		this.shotSize = 16;
		this.shotHalfSize = this.shotSize / 2;

		// Player variables
		this.player = this.new_player();
		this.shipFullThrust = 0.0625;
		this.shipMonoThrust = 0.03125;
		this.shipRealSize = 30;
		this.shipHalfRealSize = this.shipRealSize / 2;
		this.shipSize = 32;
		this.shipSpinThrust = 0.0078125;
		this.thrustHeat = 0.0125;

		// Particle variables
		this.particles = new Array();
		this.monoFade = 0.5;  // Multiplier
		this.thrustFade = 0.67;  // Multiplier
		this.debrisFade = 0.9999;  // Multiplier
		this.particleSize = 1;
		this.particleCount = 0;

		// Settings
		this.slideParticles();
		this.slideStars();
		this.toggleTextures();
		this.toggleRockCollision();
		this.toggleSpeedHack();

		// Initialize asteroids
		for (let i = 0; i < (this.wantRocks / 2); i++) {
			// Create an asteroid
			let rock = this.new_rock();

			// Set coordinates
			rock.cx = Math.random() * this.width;
			rock.cy = Math.random() * this.height;

			// Fix speeds
			// I have no idea why this is necessary
			//rock.vx*= 2;
			//rock.vy*= 2;

			// Fix sizes
			// I have no idea why this is necessary
			for (let j = 0; j < this.rockPoints; j++) {
				rock.r[j] /= 2;
			} //done

			// Add the asteroids to the array
			this.rocks.push(rock);
			this.rockCount++;
		} //done

		// Install event-handlers
		this.canvas.tabIndex = 1000;
		this.canvas.style.outline = "none";
		this.canvas.addEventListener("keydown", this.event_keyDown, true);
		this.canvas.addEventListener("keyup", this.event_keyUp, true);

		// Set timers
		this.gameLoop = setInterval(this.haxteroidsGameLoop, this.gameInt);
		this.menuTimer = setInterval(this.haxteroidsMenuTimer, this.gameInt * 30);
	} //constructor()

	////////////////////////////////////////////////////////////////////////////////

	private new_star() {
		let star = {
			r: 0, // Radius
			dia: 0, // Diameter

			x: 0, // Center x
			y: 0, // Center y
			z: 0, // Distance

			vx: 0, // x-velocity
			vy: 0, // y-velocity

			rgba: new RGBA()
		};

		// Generate more-or-less scientifically accurate star-data
		// I used https://en.wikipedia.org/wiki/Stellar_classification#Harvard_spectral_classification
		// to get the percentages, colors (RGB), luminosities (alpha), and sizes (radius).  As the
		// Wikipedia percentages did not add up to 100, I scaled them.  I also scaled the luminosities.
		star.rgba.a = Math.random();  // This is a temporary setting used to determine the stellar spectral class of the star
		// Class M
		if (star.rgba.a <= 0.765418272300) {
			star.rgba.r = 255;
			star.rgba.g = 189;
			star.rgba.b = 111;
			star.rgba.a = Math.round(0.5 + (Math.random() * 0.027));  // 0.527 - 0.5
			star.r = this.maxStarSize * (0 + (Math.random() * 0.7));  // 0.7   - 0
		} else   // Class K
			if (star.rgba.a <= 0.886563610363) {
				star.rgba.r = 255;
				star.rgba.g = 221;
				star.rgba.b = 180;
				star.rgba.a = Math.round(0.527 + (Math.random() * 0.2));  // 0.727 - 0.527
				star.r = this.maxStarSize * (0.7 + (Math.random() * 0.26));  // 0.96  - 0.7
			} else   // Class G
				if (star.rgba.a <= 0.962654897080) {
					star.rgba.r = 255;
					star.rgba.g = 244;
					star.rgba.b = 232;
					star.rgba.a = Math.round(0.727 + (Math.random() * 0.273));  // 1     - 0.727
					star.r = this.maxStarSize * (0.96 + (Math.random() * 0.19));  // 1.15  - 0.96
				} else   // Class F
					if (star.rgba.a <= 0.992690931310) {
						star.rgba.r = 251;
						star.rgba.g = 248;
						star.rgba.b = 255;
						star.rgba.a = 1;
						//		star.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
						star.r = this.maxStarSize * (1.15 + (Math.random() * 0.25));  // 1.4   - 1.15
					} else   // Class A
						if (star.rgba.a <= 0.998698138156) {
							star.rgba.r = 202;
							star.rgba.g = 216;
							star.rgba.b = 255;
							star.rgba.a = 1;
							//		star.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
							star.r = this.maxStarSize * (1.4 + (Math.random() * 0.4));  // 1.8   - 1.4
						} else   // Class B
							if (star.rgba.a <= 0.999996996400) {
								star.rgba.r = 170;
								star.rgba.g = 191;
								star.rgba.b = 255;
								star.rgba.a = 1;
								//		star.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
								star.r = this.maxStarSize * (1.8 + (Math.random() * 4.8));  // 6.6   - 1.8
							} else { // Class O
								star.rgba.r = 155;
								star.rgba.g = 176;
								star.rgba.b = 255;
								star.rgba.a = 1;
								//		star.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
								star.r = this.maxStarSize * 6.6;
								//		star.r      = maxStarSize * (6.6   + (Math.random() * 0    ));  // 6.6   - 6.6
							} //fi

		// Calculate star speed and apply distance to speed and luminosity
		star.z = 6 * Math.random();
		star.vx = star.z * this.starSpeed * this.starIVX;
		star.vy = star.z * this.starSpeed * this.starIVY;
		star.r *= star.z;
		star.dia = star.r * 2;
		star.rgba.a *= star.z / 6;

		// 'Even' means we generate the star with a static x-axis
		if (Math.round(Math.random()) == 0) {
			if (!this.speedHack)
				star.x = (this.bigAxis * -0.5) + (Math.random() * (this.bigAxis * 2.0));
			else star.x = Math.random() * (this.width + (2 * star.r));

			// 'Even' means we generate the star on the top
			if (Math.round(Math.random()) == 0) {
				if (!this.speedHack)
					star.y = this.bigAxis * -0.5;
				else star.y = 0 - star.r;

				// 'Odd' means we generate the star on the bottom
			} else {
				if (!this.speedHack)
					star.y = this.bigAxis * 1.5;
				else star.y = (this.height + star.r);
			} //fi

			// 'Odd' means we generate the star with a static y-axis
		} else {
			if (!this.speedHack)
				star.y = (this.bigAxis * -0.5) + (Math.random() * (this.bigAxis * 2.0));
			else star.y = Math.random() * (this.height + (2 * star.r));

			// 'Even' means we generate the star on the left
			if (Math.round(Math.random()) == 0) {
				if (!this.speedHack)
					star.x = this.bigAxis * -0.5;
				else star.x = (0 - star.r);

				// 'Odd' means we generate the star on the right
			} else {
				if (!this.speedHack)
					star.x = this.bigAxis * 1.5;
				else star.x = (this.width + star.r);
			} //fi
		} //fi

		return star;
	} //new_star()

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////

	private new_player() {
		let player = {
			score: 0,
			ship: new Ship(),
			//		 shotsFired: 0,
			//		rocksBroken: 0,
			//		 timePlayed: 0,
			//		  timesDied: 0
		};
		return player;
	} //new_player()

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////

	private new_rock() {
		let rock = {
			cx: 0,               // Center x
			vx: 0,               // x-velocity
			x: new Array(),     // xs

			cy: 0,               // Center y
			vy: 0,               // y-velocity
			y: new Array(),     // ys

			r: new Array(),     // Radiuses

			d: 0,               // Facing
			vd: 0,               // Spin

			irgba: new RGBA(), // Initial color
			rgba: new RGBA()  // Color
		};

		// Generate color
		rock.irgba.r = 114 - (Math.random() * 3);
		rock.irgba.g = 111 - (Math.random() * 5);
		rock.irgba.b = 106 - (Math.random() * 7);

		// Calculate radiuses
		let rockSize = (this.minRockSize + (Math.random() * (this.maxRockSize - this.minRockSize)));
		let rockSizeThird = rockSize / 3;
		for (let j = 0; j < this.rockPoints; j++) {
			rock.r.push(rockSizeThird + (Math.random() * ((rockSizeThird * 2) - rockSizeThird)));
		} //done

		// Initialize coordinates
		for (let j = 0; j < this.rockPoints; j++) {
			rock.x.push(0);
			rock.y.push(0);
		} //done

		// Set velocities
		rock.vd = Math.random() * this.maxRockSpin;
		let offsetRockSpeed = this.maxRockSpeed - this.minRockSpeed;
		rock.vx = this.minRockSpeed + (Math.random() * offsetRockSpeed);
		rock.vy = this.minRockSpeed + (Math.random() * offsetRockSpeed);

		// Allow negative velocities
		if (Math.round(Math.random()) == 0)
			rock.vd *= -1;
		if (Math.round(Math.random()) == 0)
			rock.vx *= -1;
		if (Math.round(Math.random()) == 0)
			rock.vy *= -1;

		// Set positions
		rock.d = Math.random() * 360;
		// 'Even' means we generate the rock with a static y-axis
		if (Math.round(Math.random()) == 0) {
			rock.cx = Math.random() * (this.width + (2 * rockSize));

			// If the y-velocity is positive, start the rock on the top
			if (rock.vy + this.player.ship.vy > 0)
				rock.cy = (0 - rockSize);

			// If the y-velocity is negative, start the rock on the bottom
			else rock.cy = (this.height + rockSize);

			// 'Odd' means we generate the rock with a static x-axis
		} else {
			rock.cy = Math.random() * (this.height + (2 * rockSize));

			// If the x-velocity is positive, start the rock on the left
			if (rock.vx > 0)
				rock.cx = (0 - rockSize);

			// If the x-velocity is negative, start the rock on the right
			else rock.cx = (this.width + rockSize);
		} //fi

		return rock;
	} //new_rock()

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////

	private rocksplosion(rock: {
		r: number[]; cx: number; cy: number; vx: number; vy: number; rgba: {
			r: number; // Red
			g: number; // Green
			b: number; // Blue
			a: number; // Alpha
		};
	}) {

		// Figure out the size of the rock
		let avgSize = 0;
		for (let i = 0; i < this.rockPoints; i++) {
			avgSize += rock.r[i];
		} //done
		avgSize /= this.rockPoints;
		let halfSize = avgSize;
		avgSize *= 2;

		// Create debris
		for (let i = 0; i < avgSize * this.particleMultiplier; i++) {
			let particle = new Particle();
			particle.type = ParticleType.debris;
			particle.x = (rock.cx - halfSize) + (Math.random() * avgSize);
			particle.y = (rock.cy - halfSize) + (Math.random() * avgSize);
			particle.vx = Math.random() * rock.vx * 2;
			particle.vy = Math.random() * rock.vy * 2;
			particle.rgba = rock.rgba;
			//		particle.rgba.r = Math.round(particle.rgba.r * particle.rgba.a);
			//		particle.rgba.g = Math.round(particle.rgba.g * particle.rgba.a);
			//		particle.rgba.b = Math.round(particle.rgba.b * particle.rgba.a);
			particle.rgba.a = 1 - particle.rgba.a;
			this.particles.push(particle);
			this.particleCount++;
		} //done
	} //rocksplosion()

	////////////////////////////////////////////////////////////////////////////////

	private shipsplosion(ship: any, rock: { vx: number; vy: number; }) {
		for (let l = 0; l < this.shipRealSize * 2 * this.particleMultiplier; l++) {
			let particle = new Particle();
			particle.x = (this.halfWidth - this.shipHalfRealSize) + (Math.random() * this.shipRealSize);
			particle.y = (this.halfHeight - this.shipHalfRealSize) + (Math.random() * this.shipRealSize);
			particle.vx = Math.random() * rock.vx * 2;
			particle.vy = Math.random() * (rock.vy - this.player.ship.vy);
			switch (Math.round(4 * Math.random())) {
				case 0: // Monopropellant
					particle.type = ParticleType.mono;
					particle.rgba.r = 255;
					particle.rgba.g = 255;
					particle.rgba.b = 255;
					break;
				case 1: // Liquid fuel
					particle.type = ParticleType.shot;
					particle.rgba.r = 255 - Math.round(32 * Math.random());
					particle.rgba.g = 127 + Math.round(32 - (64 * Math.random()));
					particle.rgba.b = Math.round(32 * Math.random());
					break;
				case 2: // Grey structure
					particle.type = ParticleType.debris;
					particle.rgba.r = 80;
					particle.rgba.g = 81;
					particle.rgba.b = 87;
					break;
				case 3: // Orange structure
					particle.type = ParticleType.debris;
					particle.rgba.r = 70;
					particle.rgba.g = 45;
					particle.rgba.b = 25;
					break;
				case 4: // Solar Panels
					particle.type = ParticleType.debris;
					particle.rgba.r = 17;
					particle.rgba.g = 21;
					particle.rgba.b = 26;
					break;
			} //esac
			particle.rgba.a = 1.0;
			//TODO:  Rotate the vector to match the ship's rotation
			this.particles.push(particle);
			this.particleCount++;
		} //done
	} //shipsplosion()

	////////////////////////////////////////////////////////////////////////////////

	private new_shot() {
		let shot = {
			x: 0, // x-coordinate
			y: 0, // y-coordinate
			vx: 0, // x-velocity
			vy: 0, // y-velocity
			ax: 0, // x-acceleration
			ay: 0, // y-acceleration
			d: 0  // rotation (in degrees)
		};

		// Center the shot under the ship
		shot.x = this.halfWidth - this.shotHalfSize;
		shot.y = this.halfHeight - this.shotHalfSize;
		shot.ay = 2;

		return shot;
	} //new_shot()

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////

	private shotsplosion(shot: { vx: number; vy: number; }, rock: { vx: number; vy: number; }) {
		for (let l = 0; l < this.shipRealSize * 2 * this.particleMultiplier; l++) {
			let particle = new Particle();
			particle.x = (this.halfWidth - this.shotHalfWidth) + (Math.random() * this.shotWidth);
			particle.y = (this.halfHeight - this.shotHalfHeight) + (Math.random() * this.shotHeight);
			particle.vx = Math.random() * (rock.vx - shot.vx);
			particle.vy = Math.random() * (rock.vy - shot.vy);
			switch (Math.round(Math.random())) {
				case 0: // Liquid fuel
					particle.type = ParticleType.thrust;
					particle.rgba.r = 255 - Math.round(32 * Math.random());
					particle.rgba.g = 127 + Math.round(32 - (64 * Math.random()));
					particle.rgba.b = Math.round(32 * Math.random());
					break;
				case 1: // Structure
					particle.type = ParticleType.debris;
					particle.rgba.r = 49;
					particle.rgba.g = 49;
					particle.rgba.b = 47;
					break;
			} //esac
			particle.rgba.a = 1.0;
			this.particles.push(particle);
			this.particleCount++;
		} //done
	} //shotsplosion()

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////

	private event_keyDown(event: { keyCode; }) {
		switch (event.keyCode) {

			case 38:  // Up
			case 87:  // W
				if (this.menuIndex == 1)
					this.sounds.thrust.play();
				this.upDown = true;
				break;

			case 37:  // Left
			case 65:  // A
				if (this.menuIndex == 1)
					this.sounds.mono.play();
				this.leftDown = true;
				break;

			case 40:  // Down
			case 68:  // S
				if (this.menuIndex == 1)
					this.sounds.mono.play();
				this.downDown = true;
				break;

			case 39:  // Right
			case 83:  // D
				if (this.menuIndex == 1)
					this.sounds.mono.play();
				this.rightDown = true;
				break;

			case 13:  // Enter
			case 32:  // Space
				this.spaceDown = true;
		} //esac
	} //event_keyDown()

	////////////////////////////////////////////////////////////////////////////////

	private event_keyUp(event: { keyCode; }) {
		switch (event.keyCode) {

			case 38:  // Up
			case 87:  // W
				this.sounds.thrust.pause();
				this.upDown = false;
				break;

			case 37:  // Left
			case 65:  // A
				if (!this.downDown && !this.rightDown)
					this.sounds.mono.pause();
				this.leftDown = false;
				break;

			case 40:  // Down
			case 68:  // S
				if (!this.leftDown && !this.rightDown)
					this.sounds.mono.pause();
				this.downDown = false;
				break;

			case 39:  // Right
			case 83:  // D
				if (!this.leftDown && !this.downDown)
					this.sounds.mono.pause();
				this.rightDown = false;
				break;

			case 13:  // Enter
			case 32:  // Space
				if (this.spaceDown == true) {
					switch (this.menuIndex) {
						case 2:  // Game over
							this.menuIndex = 0;
							this.player.score = 0;
							break;

						case 0:  // Main menu
							this.menuIndex = 1;
							this.player.ship.cd = this.shotCd;
							this.rocks.splice(0, this.rockCount);
							this.rockCount = 0;
							this.particles.splice(0, this.particleCount);
							this.particleCount = 0;
							this.shots.splice(0, this.shotCount);
							this.shotCount = 0;
							this.sounds.ship.play();
							this.menuIndex = 1;
							break;
					} //esac
				} //fi
				this.spaceDown = false;
		} //esac
	} //event_keyUp()

	////////////////////////////////////////////////////////////////////////////////

	private haxteroidsMenuTimer() {
		if (this.menuShow) this.menuShow = false;
		else this.menuShow = true;
	} //haxteroidsMenuTimer()

	////////////////////////////////////////////////////////////////////////////////

	private haxteroidsGameLoop() {

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
		// Missiles

		for (let i = 0; i < this.shotCount; i++) {

			// Remove missiles when they leave the screen
			//TODO

			// Calculate missile vectors
			//TODO

			// Change missile position
			this.shots[i].vx += this.shots[i].ax;
			this.shots[i].vy += this.shots[i].ay;
			this.shots[i].x += this.shots[i].vx;
			this.shots[i].y += this.shots[i].vy;

			// Create particles
			//TODO

		} //done

		// Update missile cooldowns and fire new missiles
		if (this.spaceDown && this.player.ship.cd == 0) {
			this.sounds.shot.currentTime = 0;
			//		this.sounds.shot.play();
			this.player.ship.cd = this.shotCd;
			this.shots.push(this.new_shot());
			this.shotCount++;
		} //fi

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

		if (!this.speedHack) {
			// Remove stars that are no longer reachable via rotation
			for (let i = 0; i < this.starCount; i++) {
				if (this.stars[i].x < 0 - this.bigAxis * 0.5
					|| this.stars[i].x > this.bigAxis * 1.5
					|| this.stars[i].y < 0 - this.bigAxis * 0.5
					|| this.stars[i].y > this.bigAxis * 1.5) { //if
					this.stars.splice(i, 1);
					this.starCount--;
				} //fi
			} //done
		} else {
			// Remove stars that are no longer on the screen
			for (let i = 0; i < this.starCount; i++) {
				if (this.stars[i].x < 0 - this.stars[i].dia
					|| this.stars[i].x > this.width + this.stars[i].dia
					|| this.stars[i].y < 0 - this.stars[i].dia
					|| this.stars[i].y > this.height + this.stars[i].dia) { //if
					this.stars.splice(i, 1);
					this.starCount--;
				} //fi
			} //done
		} //fi

		// Add stars if there aren't enough
		while (this.starCount < this.wantStars) {
			this.stars.push(this.new_star());
			this.starCount++;
		} //done

		// Apply velocity
		for (let i = 0; i < this.starCount; i++) {
			this.stars[i].x += this.stars[i].vx;
			this.stars[i].y += this.stars[i].vy;
		} //done

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

		if (!this.speedHack) {
			// Remove asteroids when they are no longer reachable via rotation
			for (let i = 0; i < this.rockCount; i++) {
				if (this.rocks[i].cx < 0 - this.maxRockSize / 2
					|| this.rocks[i].cx > this.width + this.maxRockSize / 2
					|| this.rocks[i].cy < 0 - this.maxRockSize / 2
					|| this.rocks[i].cy > this.height + this.maxRockSize / 2) { //if
					this.rocks.splice(i, 1);
					this.rockCount--;
				} //fi
			} //done
		} else {
			// Remove asteroids when they leave the screen
			for (let i = 0; i < this.rockCount; i++) {
				if (this.rocks[i].cx < 0 - this.maxRockSize / 2
					|| this.rocks[i].cx > this.width + this.maxRockSize / 2
					|| this.rocks[i].cy < 0 - this.maxRockSize / 2
					|| this.rocks[i].cy > this.height + this.maxRockSize / 2) { //if
					this.rocks.splice(i, 1);
					this.rockCount--;
				} //fi
			} //done
		} //fi

		// Add asteroids if there aren't enough.  Never add more than 1/4 the desired asteroids at once.
		for (let i = 0; i < this.wantRocks / 4 && this.rockCount < this.wantRocks; i++) { //if
			// Set unconfigurable variables
			this.rocks.push(this.new_rock());
			this.rockCount++;
		} //fi

		// Update asteroids
		for (let i = 0; i < this.rockCount; i++) {

			// Variables
			let newcx = this.rocks[i].cx;
			let newcy = this.rocks[i].cy;

			// Calculate and apply delta-v (more distant asteroids are slower)
			this.rocks[i].d += this.rocks[i].vd;
			newcx += (this.rocks[i].vx / 2) + ((this.rocks[i].vx * ((this.wantRocks - i) / this.wantRocks)) / 2);
			newcy += (this.rocks[i].vy / 2) + ((this.rocks[i].vy * ((this.wantRocks - i) / this.wantRocks)) / 2);

			// The center must be an int or else the texture freaks out
			if (this.useTextures) {
				if (newcx < this.rocks[i].cx)
					this.rocks[i].cx = Math.floor(newcx);
				else this.rocks[i].cx = Math.ceil(newcx);
				if (newcy < this.rocks[i].cy)
					this.rocks[i].cy = Math.floor(newcy);
				else this.rocks[i].cy = Math.ceil(newcy);
			} else {
				this.rocks[i].cx = newcx;
				this.rocks[i].cy = newcy;
			} //fi

			// Prevent overflows
			if (this.rocks[i].d >= 360) this.rocks[i].d -= 360;
			if (this.rocks[i].d <= -360) this.rocks[i].d += 360;

			// Calculate asteroid points.  Overall size is influenced by asteroid index.
			for (let j = 0; j < this.rockPoints; j++) {
				//              Center         Angle formula                                  Rotation                           Radius           Resizing formula
				this.rocks[i].x[j] = this.rocks[i].cx + (Math.sin((j * ((Math.PI * 2) / this.rockPoints)) + (this.rocks[i].d * (Math.PI / 180)))) * (this.rocks[i].r[j] * (0.75 + ((this.wantRocks - i) / (this.wantRocks * 6))));
				this.rocks[i].y[j] = this.rocks[i].cy + (Math.cos((j * ((Math.PI * 2) / this.rockPoints)) + (this.rocks[i].d * (Math.PI / 180)))) * (this.rocks[i].r[j] * (0.75 + ((this.wantRocks - i) / (this.wantRocks * 6))));
				//	rocks[i].x[j] = Math.round(rocks[i].x[j]);  // The points must be ints
				//	rocks[i].y[j] = Math.round(rocks[i].y[j]);  // The points must be ints
			} //done

			// Apply shading per asteroid index
			this.rocks[i].rgba.a = 0.50 * (i / this.wantRocks);
		} //done

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
		// Ship calculations
		if (this.menuIndex == 1) {

			// Calculate delta-V
			if (this.upDown)
				this.player.ship.vy += this.shipFullThrust;
			if (this.leftDown)
				this.player.ship.vd += this.shipSpinThrust;
			if (this.downDown)
				this.player.ship.vy -= this.shipMonoThrust;
			if (this.rightDown)
				this.player.ship.vd -= this.shipSpinThrust;
			this.player.ship.vr = this.player.ship.vd * (Math.PI / 180);

			// Calculate heat
			if (this.upDown) {
				if (this.player.ship.h < 1)
					this.player.ship.h += this.thrustHeat;
				else this.player.ship.h = 1;
			} else {
				if (this.player.ship.h > this.thrustHeat)
					this.player.ship.h -= this.thrustHeat;
				else this.player.ship.h = 0;
			} //fi

			// Create exhaust particles
			if (this.upDown) {
				for (let i = 0; i < 6 * this.particleMultiplier; i++) {
					let particle = new Particle();
					particle.type = ParticleType.shot;
					particle.x = (this.halfWidth - 2) + (4 * Math.random());
					particle.y = (this.halfHeight + 15);
					particle.vx = 0;
					particle.vy = (2 + (4 * Math.random())) - this.player.ship.vy;
					particle.rgba.r = 255 - Math.round(32 * Math.random());
					particle.rgba.g = 127 + Math.round(32 - (64 * Math.random()));
					particle.rgba.b = Math.round(32 * Math.random());
					this.particles.push(particle);
					this.particleCount++;
				} //done
			} //fi
			if (this.leftDown) {
				for (let i = 0; i < 3 * this.particleMultiplier; i++) {
					let particle = new Particle();
					particle.type = ParticleType.mono;
					particle.x = this.halfWidth + 4;
					particle.y = this.halfHeight - 4;
					particle.vx = 0 + (4 * Math.random());
					particle.vy = (3 - (4 * Math.random())) - this.player.ship.vy;
					particle.rgba.r = 255;
					particle.rgba.g = 255;
					particle.rgba.b = 255;
					this.particles.push(particle);
					this.particleCount++;
				} //done
			} //fi
			if (this.downDown) {
				for (let i = 0; i < 3 * this.particleMultiplier; i++) {
					let particle = new Particle();
					particle.type = ParticleType.mono;
					particle.x = this.halfWidth;
					particle.y = this.halfHeight - 4;
					particle.vx = 2 - (4 * Math.random());
					particle.vy = (-2 - (4 * Math.random())) - this.player.ship.vy;
					particle.rgba.r = 255;
					particle.rgba.g = 255;
					particle.rgba.b = 255;
					this.particles.push(particle);
					this.particleCount++;
				} //done
			} //fi
			if (this.rightDown) {
				for (let i = 0; i < 3 * this.particleMultiplier; i++) {
					let particle = new Particle();
					particle.type = ParticleType.mono;
					particle.x = this.halfWidth - 4;
					particle.y = this.halfHeight - 4;
					particle.vx = 0 - (4 * Math.random());
					particle.vy = (3 - (4 * Math.random())) - this.player.ship.vy;
					particle.rgba.r = 255;
					particle.rgba.g = 255;
					particle.rgba.b = 255;
					this.particles.push(particle);
					this.particleCount++;
				} //done
			} //fi
		} //fi

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
		// Particle physics

		// Remove invisible particles
		for (let i = 0; i < this.particleCount; i++) {
			if (this.particles[i].rgba.a < 0.05) {
				this.particles.splice(i, 1);
				this.particleCount--;
			} //fi
		} //done

		// Remove off-screen particles
		for (let i = 0; i < this.particleCount; i++) {
			if (this.particles[i].x < 0
				|| this.particles[i].x > this.width
				|| this.particles[i].y < 0
				|| this.particles[i].y > this.height) { //if
				this.particles.splice(i, 1);
				this.particleCount--;
			} //fi
		} //done

		// Calculate particle positions
		for (let i = 0; i < this.particleCount; i++) {
			this.particles[i].x += this.particles[i].vx;
			this.particles[i].y += this.particles[i].vy;
		} //done

		// Calculate particle alphas
		for (let i = 0; i < this.particleCount; i++) {
			switch (this.particles[i].type) {

				case 0:
					this.particles[i].rgba.a *= this.debrisFade;
					break;

				case 1:
					this.particles[i].rgba.a *= this.monoFade;
					break;

				case 2:
				case 3:
					this.particles[i].rgba.a *= this.thrustFade;
					break;

				default:
					this.particles[i].rgba.a *= this.debrisFade;
					break;
			} //esac
		} //done

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
		// Apply rotation

		if (this.menuIndex == 1) {
			// Particles
			for (let i = 0; i < this.particleCount; i++) {

				// Calculate new positions
				let hypotenuse = Math.sqrt(Math.pow(this.particles[i].x - this.halfWidth, 2) + Math.pow(this.particles[i].y - this.halfHeight, 2));
				let radians = Math.atan2(this.particles[i].y - this.halfHeight, this.particles[i].x - this.halfWidth) + this.player.ship.vr;
				this.particles[i].x = this.halfWidth + (hypotenuse * Math.cos(radians + this.player.ship.vr));
				this.particles[i].y = this.halfHeight + (hypotenuse * Math.sin(radians + this.player.ship.vr));

				// Calculate new vectors
				hypotenuse = Math.sqrt(Math.pow(this.particles[i].vx, 2) + Math.pow(this.particles[i].vy, 2));
				radians = Math.atan2(this.particles[i].vy, this.particles[i].vx) + this.player.ship.vr;
				let cos = Math.cos(radians);
				let sin = Math.sin(radians);
				//			particles[i].vx = (particles[i].vx * cos) - (particles[i].vy * sin);
				//			particles[i].vy = (particles[i].vx * sin) + (particles[i].vy * cos);

			} //done

			// Asteroids
			for (let i = 0; i < this.rockCount; i++) {

				// Calculate new positions
				let hypotenuse = Math.sqrt(Math.pow(this.rocks[i].cx - this.halfWidth, 2) + Math.pow(this.rocks[i].cy - this.halfHeight, 2));
				let radians = Math.atan2(this.rocks[i].cy - this.halfHeight, this.rocks[i].cx - this.halfWidth) + this.player.ship.vr;
				this.rocks[i].cx = this.halfWidth + (hypotenuse * Math.cos(radians));
				this.rocks[i].cy = this.halfHeight + (hypotenuse * Math.sin(radians));

				// Calculate new rotations
				//TODO:  This isn't accurate.
				this.rocks[i].d -= this.player.ship.vd;

				// Calculate new vectors
				hypotenuse = Math.sqrt(Math.pow(this.rocks[i].vx, 2) + Math.pow(this.rocks[i].vy, 2));
				radians = Math.atan2(this.rocks[i].vy, this.rocks[i].vx) + this.player.ship.vr;
				let cos = Math.cos(radians);
				let sin = Math.sin(radians);
				//			rocks[i].vx = (rocks[i].vx * cos) - (rocks[i].vy * sin);
				//			rocks[i].vy = (rocks[i].vx * sin) + (rocks[i].vy * cos);

			} //done

			// Missiles
			for (let i = 0; i < this.shotCount; i++) {

				// Calculate new positions
				let hypotenuse = Math.sqrt(Math.pow(this.shots[i].x - this.halfWidth, 2) + Math.pow(this.shots[i].y - this.halfHeight, 2));
				let radians = Math.atan2(this.shots[i].y - this.halfHeight, this.shots[i].x - this.halfWidth) + this.player.ship.vr;
				this.shots[i].x = this.halfWidth + (hypotenuse * Math.cos(radians + this.player.ship.vr));
				this.shots[i].y = this.halfHeight + (hypotenuse * Math.sin(radians + this.player.ship.vr));

				// Calculate new rotations
				//TODO:  This isn't accurate.
				this.shots[i].d -= this.player.ship.vd;

				// Calculate new vectors
				hypotenuse = Math.sqrt(Math.pow(this.shots[i].vx, 2) + Math.pow(this.shots[i].vy, 2));
				radians = Math.atan2(this.shots[i].vy, this.shots[i].vx) + this.player.ship.vr;
				let cos = Math.cos(radians);
				let sin = Math.sin(radians);
				//			shots[i].vx = (shots[i].vx * cos) - (shots[i].vy * sin);
				//			shots[i].vy = (shots[i].vx * sin) + (shots[i].vy * cos);

			} //done

			// Stars
			for (let i = 0; i < this.starCount; i++) {

				// Calculate new positions
				let hypotenuse = Math.sqrt(Math.pow(this.stars[i].x - this.halfWidth, 2) + Math.pow(this.stars[i].y - this.halfHeight, 2));
				let radians = Math.atan2(this.stars[i].y - this.halfHeight, this.stars[i].x - this.halfWidth) + this.player.ship.vr;
				this.stars[i].x = this.halfWidth + (hypotenuse * Math.cos(radians + this.player.ship.vr));
				this.stars[i].y = this.halfHeight + (hypotenuse * Math.sin(radians + this.player.ship.vr));

				// Calculate new vectors
				hypotenuse = Math.sqrt(Math.pow(this.stars[i].vx, 2) + Math.pow(this.stars[i].vy, 2));
				radians = Math.atan2(this.stars[i].vy, this.stars[i].vx) + this.player.ship.vr;
				let cos = Math.cos(radians);
				let sin = Math.sin(radians);
				//			stars[i].vx = (stars[i].vx * cos) - (stars[i].vy * sin);
				//			stars[i].vy = (stars[i].vx * sin) + (stars[i].vy * cos);

			} //done

			// Apply delta-V
			for (let i = 0; i < this.starCount; i++) {
				this.stars[i].y += this.stars[i].z * (this.player.ship.vy / 50);
			} //done
			for (let i = 0; i < this.shotCount; i++) {
				this.shots[i].y += this.player.ship.vy;
			} //done
			for (let i = 0; i < this.rockCount; i++) {
				this.rocks[i].cy += this.player.ship.vy;
			} //done
			for (let i = 0; i < this.particleCount; i++) {
				this.particles[i].y += this.player.ship.vy;
			} //done
		} //fi

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
		// Collision

		// Calculate ship collisions
		if (this.menuIndex == 1) {
			// Vs particles
			for (let i = 0; i < this.particleCount; i++) {
				if (this.halfWidth - this.shipHalfRealSize <= this.particles[i].x
					&& this.halfWidth + this.shipHalfRealSize >= this.particles[i].x
					&& this.halfHeight - this.shipHalfRealSize <= this.particles[i].y
					&& this.halfHeight + this.shipHalfRealSize >= this.particles[i].y) { //if
					if (this.particles[i].type == 0) {
						this.player.score++;
						this.particles.splice(i, 1);
						i--;
						this.particleCount--;
					} //fi
				} //fi
			} //done
		} //fi

		// Calculate asteroid collisions
		// let rockOffset = rockCount / 3;
		for (let i = 0; i < this.rockCount; i++) {

			// Get the average size of the asteroid
			let avgSize1 = this.rocks[i].r[0];
			let smallSize1 = this.rocks[i].r[0];
			for (let j = 1; j < this.rockPoints; j++) {
				avgSize1 += this.rocks[i].r[j];
				if (this.rocks[i].r[j] < smallSize1)
					smallSize1 = this.rocks[i].r[j];
			} //done
			avgSize1 /= this.rockPoints;
			let halfSize1 = avgSize1;
			avgSize1 *= 2;

			// Vs particles
			for (let j = 0; j < this.particleCount; j++) {
				if (this.rocks[i].cx - smallSize1 <= this.particles[j].x
					&& this.rocks[i].cx + smallSize1 >= this.particles[j].x
					&& this.rocks[i].cy - smallSize1 <= this.particles[j].y
					&& this.rocks[i].cy + smallSize1 >= this.particles[j].y) { //if
					this.particles.splice(j, 1);
					j--;
					this.particleCount--;
				} //fi
			} //done

			// Vs missiles
			for (let j = 0; j < this.shotCount; j++) {
				//TODO
			} //done

			// Vs rocks
			// The particles that result from this are computationally intensive, so I added a toggle.
			if (this.rockCollision) {
				for (let l = 0; l < this.rockCount; l++) {

					// Only rocks with similar z-axises should collide.
					if (l != i /*&& !(l > i + rockOffset || l < i - rockOffset)*/) {

						//					if(speedHack) {
						// Get the average size of the asteroid
						let avgSize2 = 0;
						for (let j = 0; j < this.rockPoints; j++) {
							avgSize2 += this.rocks[l].r[j];
						} //done
						avgSize2 /= this.rockPoints;
						let halfSize2 = avgSize2;
						avgSize2 *= 2;

						if (this.rocks[i]
							&& this.rocks[i].cx - halfSize1 <= this.rocks[l].cx + halfSize2
							&& this.rocks[i].cx + halfSize1 >= this.rocks[l].cx - halfSize2
							&& this.rocks[i].cy - halfSize1 <= this.rocks[l].cy + halfSize2
							&& this.rocks[i].cy + halfSize1 >= this.rocks[l].cy - halfSize2) { //if
							this.rocksplosion(this.rocks[i]);
							this.rocksplosion(this.rocks[l]);
							if (i > l) {
								this.rocks.splice(i, 1);
								this.rocks.splice(l, 1);
							} else {
								this.rocks.splice(l, 1);
								this.rocks.splice(i, 1);
							} //fi
							i--;
							l--;
							this.rockCount -= 2;
						} //fi

						//					// This way is technically accurate, but absolutely ridiculously computationally intensive.  My laptop can't run it.
						//					} else {
						//						for(let j = 0; j < rockPoints; j++) {
						//							for(let k = 0; k < rockPoints; k++) {
						//								for(let m = 0; m < rockPoints; m++) {
						//									for(let n = 0; n < rockPoints; n++) {
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
			let shipDead = false;
			if (this.menuIndex == 1 && this.rocks[i]) {
				for (let j = 0; j < this.rockPoints; j++) {
					for (let k = 0; k < this.rockPoints; k++) {
						if (this.rocks[i].x[j] <= this.halfWidth + this.shipHalfRealSize && this.rocks[i].x[k] >= this.halfWidth - this.shipHalfRealSize
							&& this.rocks[i].x[j] >= this.halfWidth - this.shipHalfRealSize && this.rocks[i].x[k] <= this.halfWidth + this.shipHalfRealSize
							&& this.rocks[i].y[j] <= this.halfHeight + this.shipHalfRealSize && this.rocks[i].y[k] >= this.halfHeight - this.shipHalfRealSize
							&& this.rocks[i].y[j] >= this.halfHeight - this.shipHalfRealSize && this.rocks[i].y[k] <= this.halfHeight + this.shipHalfRealSize) { //if
							shipDead = true;
							this.sounds.boom.play();
							this.rocksplosion(this.rocks[i]);
							this.shipsplosion(this.player.ship, this.rocks[i]);
							this.rocks.splice(i, 1);
							i--;
							this.rockCount--;
							this.menuIndex = 2;
							this.sounds.shot.pause();
							this.sounds.shot.currentTime = 0;
							this.sounds.ship.pause();
							this.sounds.ship.currentTime = 0;
							this.sounds.mono.pause();
							this.sounds.mono.currentTime = 0;
							this.sounds.thrust.pause();
							this.sounds.thrust.currentTime = 0;
							this.player.ship = new Ship();
							break;
						} // fi
					} //done
					if (shipDead) break;
				} //done
			} //fi
			if (shipDead) break;
		} //done

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

		// Draw background (black)
		this.context.fillStyle = "rgba(0, 0, 0, 1)";
		this.context.rect(0, 0, this.width, this.height);
		this.context.fill();

		// Draw stars
		// This doesn't actually draw stars in order of distance.  I might make it do so, but it would slow down the game and not really result in a noticeable improvement in realism.
		for (let i = 0; i < this.starCount; i++) {
			// Only draw stars that are on the screen
			if (this.stars[i].x >= 0 - this.stars[i].r
				|| this.stars[i].x <= this.width + this.stars[i].r
				|| this.stars[i].y >= 0 - this.stars[i].r
				|| this.stars[i].y <= this.height + this.stars[i].r) { //if
				// Stars are really bright, so from our perspective, we can only see what color they are from their border.
				this.context.fillStyle = "rgba(255, 255, 255, " + this.stars[i].rgba.a.toString() + ")";
				this.context.strokeStyle = "rgba(" + this.stars[i].rgba.r.toString()
					+ ", " + this.stars[i].rgba.g.toString()
					+ ", " + this.stars[i].rgba.b.toString()
					+ ", " + this.stars[i].rgba.a.toString()
					+ ")";
				this.context.beginPath();
				this.context.arc(this.stars[i].x, this.stars[i].y, this.stars[i].r, 0, 2 * Math.PI, false);
				this.context.closePath();
				this.context.fill();
				this.context.stroke();
			} //fi
		} //done

		// Draw missiles
		for (let i = 0; i < this.shotCount; i++) {
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
		for (let i = 0; i < this.particleCount; i++) {
			if (this.particles[i].type == 3) {
				this.context.fillStyle = "rgba(" + this.particles[i].rgba.r.toString()
					+ ", " + this.particles[i].rgba.g.toString()
					+ ", " + this.particles[i].rgba.b.toString()
					+ ", " + this.particles[i].rgba.a.toString()
					+ ")"
				this.context.beginPath();
				this.context.arc(this.particles[i].x, this.particles[i].y, this.particleSize, 0, 2 * Math.PI, false);
				this.context.closePath();
				this.context.fill();
			} //fi
		} //done

		// Draw spaceship
		if (this.menuIndex == 1) {
			this.context.drawImage(this.graphics.ship, (this.width - this.shipSize) / 2, (this.height - this.shipSize) / 2, this.shipSize, this.shipSize);
			this.context.globalAlpha = this.player.ship.h;
			this.context.drawImage(this.graphics.shipHot, (this.width - this.shipSize) / 2, (this.height - this.shipSize) / 2, this.shipSize, this.shipSize);
			this.context.globalAlpha = 1;
		} //fi

		// Draw non-missile particles
		for (let i = 0; i < this.particleCount; i++) {
			if (this.particles[i].type != 3) {
				this.context.fillStyle = "rgba(" + this.particles[i].rgba.r.toString()
					+ ", " + this.particles[i].rgba.g.toString()
					+ ", " + this.particles[i].rgba.b.toString()
					+ ", " + this.particles[i].rgba.a.toString()
					+ ")"
				this.context.beginPath();
				this.context.arc(this.particles[i].x, this.particles[i].y, this.particleSize, 0, 2 * Math.PI, false);
				this.context.closePath();
				this.context.fill();
			} //fi
		} //done

		// Draw asteroids
		this.context.strokeStyle = "rgba(0, 0, 0, 0.5)";  // Shadow
		for (let i = 0; i < this.rockCount; i++) {

			// Calculate spritesheet frame
			let degrees = this.rocks[i].d;
			if (degrees < 0) degrees += 360;

			// Set asteroid fill
			if (!this.useTextures) {
				this.context.fillStyle = "rgba(" + this.rocks[i].rgba.r.toString()
					+ ", " + this.rocks[i].rgba.g.toString()
					+ ", " + this.rocks[i].rgba.b.toString()
					+ ", 1)";
			} //fi

			// Draw asteroids
			if (this.useTextures)
				this.context.save();
			this.context.beginPath();
			let cx = 0;
			let cy = 0;
			for (let j = 0; j < this.rockPoints; j++) {
				if (j <= 0) {
					this.context.moveTo(this.rocks[i].x[j],
						this.rocks[i].y[j]);
				} else {
					this.context.lineTo(this.rocks[i].x[j],
						this.rocks[i].y[j]);
				} //fi
				cx += this.rocks[i].x[j];
				cy += this.rocks[i].y[j];
			} //done
			this.context.lineTo(this.rocks[i].x[0],
				this.rocks[i].y[0]);
			cx = Math.round(cx / this.rockPoints);
			cy = Math.round(cy / this.rockPoints);
			this.context.closePath();
			if (this.useTextures) {
				this.context.clip();
				this.context.drawImage(
					this.graphics.rock,                               // Image to use
					0,                                           // x-origin (frame)
					this.rockSpriteSize * Math.floor(360 - degrees),  // y-origin (frame)
					this.rockSpriteSize,                              // width    (frame)
					this.rockSpriteSize,                              // height   (frame)
					this.rocks[i].cx - (this.maxRockSize / 2),             // x-origin (canvas)
					this.rocks[i].cy - (this.maxRockSize / 2),             // y-origin (canvas)
					this.maxRockSize,                                 // width    (canvas)
					this.maxRockSize                                  // height   (canvas)
				);
				this.context.restore();
			} //fi
			if (!this.useTextures)
				this.context.fill();
			this.context.fillStyle = "rgba(0, 0, 0, " + this.rocks[i].rgba.a.toString() + ')';
			this.context.fill();
			this.context.stroke();
		} //done

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

		// Draw GUI
		switch (this.menuIndex) {

			case 0:  // Main menu
				this.context.strokeStyle = "rgba(255, 255, 255, 255)";
				if (this.menuShow == true) {
					this.context.drawImage(this.graphics.menu11, 0, 0, this.width, this.height);
				} else {
					this.context.drawImage(this.graphics.menu10, 0, 0, this.width, this.height);
				} //fi
				this.sounds.ship.pause();  // Also handle music
				break;

			case 1:  // Game
				this.sounds.ship.play();  // Also handle music
				break;

			case 2:  // Game over
				if (this.menuShow == true) {
					this.context.drawImage(this.graphics.menu21, 0, 0, this.width, this.height);
				} else {
					this.context.drawImage(this.graphics.menu20, 0, 0, this.width, this.height);
				} //fi
				this.sounds.ship.pause();  // Also handle music
				break;
		} //esac

		//	//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
		//	// Sounds
		//	switch(menuIndex) {
		//		case 1:
		//			// Monopropellant
		//			let soundCutOff = sounds.mono.duration - (gameInt / 500);
		//			if(!downDown && !rightDown && !leftDown)
		//				sounds.mono.pause();
		//			if(downDown || rightDown || leftDown)
		//				sounds.mono.play();
		//			if(sounds.mono.currentTime  > soundCutOff)
		//				sounds.mono.currentTime-= soundCutOff;
		//			// Thruster
		//			let soundCutOff = sounds.thrust.duration - (gameInt / 500);
		//			if(!upDown)
		//				sounds.thrust.pause();
		//			if(upDown)
		//				sounds.thrust.play();
		//			if(sounds.thrust.currentTime  > soundCutOff)
		//				sounds.thrust.currentTime-= soundCutOff;
		//			// Ambience
		//			let soundCutOff = sounds.ship.duration - (gameInt / 500);
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
		if (this.player.ship.cd >= this.gameSecs)
			this.player.ship.cd -= this.gameSecs;
		else this.player.ship.cd = 0;

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

		// Check for memory corruption
		if (!this.speedHack) {
			if (this.particleCount < 0) this.particleCount = 0;
			if (this.rockCount < 0) this.rockCount = 0;
			if (this.shotCount < 0) this.shotCount = 0;
			if (this.starCount < 0) this.starCount = 0;
		} //fi

		//  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
		// Update scores
		if (this.menuIndex == 1) {
			// You gain points simply by staying alive.
			if (this.rockCollision) {
				if (this.particleMultiplier > 1)
					this.player.score += 1 / this.gameInt;
				else this.player.score += 2 / this.gameInt;
			} else this.player.score += 4 / this.gameInt;
			document.getElementById("scoreSpan").innerHTML = Math.floor(this.player.score).toString();
		} //fi

	} //haxteroidsGameLoop()

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	// Settings

	public slideParticles() {
		const value: number = Number.parseInt((document.getElementById("particleSlider") as HTMLInputElement).value);

		// Remove all particles if the multiplier is 0
		if (value == 0) {
			this.particles.splice(0, this.particleCount);
			this.particleCount = 0;
		} //fi

		// Set the new particle multiplier
		this.particleMultiplier = Math.pow(value, 2);

		// Update setting-label
		switch (value) {
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

	public slideStars() {
		const value: number = Number.parseInt((document.getElementById("starSlider") as HTMLInputElement).value);

		// Speedhack
		let mult: number;
		if (!this.speedHack)
			mult = 768;
		else mult = 256;

		// If we're decreasing the number of stars, delete all existing stars
		if (this.wantStars > mult * value) {
			this.stars.splice(0, this.wantStars);
			this.starCount = 0;
		} //fi

		// Set the new star limit to the value of the slider
		this.wantStars = mult * value;

		// Create new stars
		let star;
		if (!this.speedHack) {
			for (let i = this.starCount; i < this.wantStars; i++) {
				star = this.new_star();
				star.x = (this.bigAxis * -0.5) + (Math.random() * this.bigAxis * 2.0);
				star.y = (this.bigAxis * -0.5) + (Math.random() * this.bigAxis * 2.0);
				this.stars.push(star);
				this.starCount++;
			} //done
		} else {
			for (let i = this.starCount; i < this.wantStars; i++) {
				star = this.new_star();
				star.x = Math.random() * this.width;
				star.y = Math.random() * this.height;
				this.stars.push(star);
				this.starCount++;
			} //done
		} //fi

		// Update setting-label
		switch (value) {
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

	public toggleTextures() {
		const checked: boolean = (document.getElementById("texturesToggle") as HTMLInputElement).checked;
		this.useTextures = checked;
	} //textureToggle()

	public toggleRockCollision() {
		const checked: boolean = (document.getElementById("rockCollisionToggle") as HTMLInputElement).checked;
		this.rockCollision = checked;
		for (let i = 0; i < this.particleCount; i++) {
			if (this.particles[i].type == 0) {
				this.particles.splice(i, 1);
				i--;
				this.particleCount--;
			} //fi
		} //done
	} //rockCollision()

	public toggleSpeedHack() {
		const checked: boolean = (document.getElementById("speedHackToggle") as HTMLInputElement).checked;
		this.speedHack = checked;
		this.slideStars();
	} //rockCollision()

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	// Infobox

	public showPremise() {
		document.getElementById("instructions").style.display = "none";
		document.getElementById("settings").style.display = "none";  // Is most likely to be the previous screen, so should be done next-to-last.
		document.getElementById("premise").style.display = "block";  // Is being unhidden, so should be done last.
	} //showPremise()

	public showInstructions() {
		document.getElementById("settings").style.display = "none";
		document.getElementById("premise").style.display = "none";        // Is most likely to be the previous screen, so should be done next-to-last.
		document.getElementById("instructions").style.display = "block";  // Is being unhidden, so should be done last.
	} //showInstructions()

	public showSettings() {
		document.getElementById("premise").style.display = "none";
		document.getElementById("instructions").style.display = "none";  // Is most likely to be the previous screen, so should be done next-to-last.
		document.getElementById("settings").style.display = "block";     // Is being unhidden, so should be done last.
	} //showSettings()
}
