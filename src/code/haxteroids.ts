import { Particle, ParticleType } from 'classes/particle.class';
import { Player } from 'classes/player.class';
import { Rock } from 'classes/rock.class';
import { Ship } from 'classes/ship.class';
import { Star } from 'classes/star.class';
import { Defines } from 'defines.const';

////////////////////////////////////////////////////////////////////////////////
export class Haxteroids {

    // Resources
    private readonly graphics: { [key: string]: HTMLImageElement; };
    private readonly sounds: { [key: string]: HTMLAudioElement; };

    // Settings
    private particleMultiplier: number;
    private rockCollision: boolean;
    private speedHack: boolean;
    private useTextures: boolean;

    // DOM variables
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;

    // Game variables
    private menuIndex: number;

    // Scale variables
    private readonly height: number;
    private readonly halfHeight: number;
    private readonly halfWidth: number;
    private readonly width: number;
    private readonly bigAxis: number;

    // Input variables
    private downDown: boolean;
    private leftDown: boolean;
    private rightDown: boolean;
    private spaceDown: boolean;
    private upDown: boolean;
    private menuShow: boolean;

    // Star variables
    private readonly stars: Array<any>;
    private starCount: number;
    private wantStars: number;

    // Asteroid variables
    private readonly rocks: Array<any>;
    private rockCount: number;
    private wantRocks: number;

    // Missile variables
    private readonly shots: Array<any>;
    private shotCount: number;
    private readonly shotCD: number

    // Ship variables
    private readonly player: Player;

    // Particle variables
    private readonly particles: Array<any>;
    private particleCount: number;

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    constructor() {

        // HTML
        this.showPremise();

        // Audio
        this.sounds = {
            boom: new Audio('res/boom.ogg'),
            mono: new Audio('res/mono.ogg'),
            ship: new Audio('res/ship.ogg'),
            shot: new Audio('res/shot.ogg'),
            thrust: new Audio('res/thrust.ogg')
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
        this.graphics.rock.src = 'res/rock.png';
        this.graphics.ship.src = 'res/ship.png';
        this.graphics.shipHot.src = 'res/shiphot.png';
        this.graphics.shot.src = 'res/shot.png';
        this.graphics.menu10.src = 'res/menu(1, 0).png';
        this.graphics.menu11.src = 'res/menu(1, 1).png';
        this.graphics.menu20.src = 'res/menu(2, 0).png';
        this.graphics.menu21.src = 'res/menu(2, 1).png';

        // DOM Variables
        this.canvas = document.getElementById('haxteroids') as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d');
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
        this.stars = new Array();
        this.starCount = 0;

        // Asteroid variables
        this.rocks = new Array();
        this.rockCount = 0;
        this.wantRocks = 16;

        // Missile variables
        this.shotCD = this.sounds.shot.duration;  // Cooldown for missiles
        this.shots = new Array();
        this.shotCount = 0;

        // Ship variables
        this.player = new Player();

        // Particle variables
        this.particles = new Array();
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
            const rock = new Rock(this.player, this.width, this.height);

            // Set coordinates
            rock.cx = Math.random() * this.width;
            rock.cy = Math.random() * this.height;

            // Fix speeds
            // I have no idea why this is necessary
            //rock.vx*= 2;
            //rock.vy*= 2;

            // Fix sizes
            // I have no idea why this is necessary
            for (let j = 0; j < Defines.rockPoints; j++) {
                rock.r[j] /= 2;
            } //done

            // Add the asteroids to the array
            this.rocks.push(rock);
            this.rockCount++;
        } //done

        // Install event-handlers
        this.canvas.tabIndex = 1000;
        this.canvas.style.outline = 'none';
        this.canvas.addEventListener('keydown', this.event_keyDown, true);
        this.canvas.addEventListener('keyup', this.event_keyUp, true);

        // Set timers
        setInterval(this.haxteroidsGameLoop, Defines.gameInt);
        setInterval(this.haxteroidsMenuTimer, Defines.gameInt * 30);
    } //constructor()

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
        for (let i = 0; i < Defines.rockPoints; i++) {
            avgSize += rock.r[i];
        } //done
        avgSize /= Defines.rockPoints;
        const halfSize = avgSize;
        avgSize *= 2;

        // Create debris
        for (let i = 0; i < avgSize * this.particleMultiplier; i++) {
            const particle = new Particle();
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
        for (let l = 0; l < Defines.shipRealSize * 2 * this.particleMultiplier; l++) {
            const particle = new Particle();
            particle.x = (this.halfWidth - Defines.shipHalfRealSize) + (Math.random() * Defines.shipRealSize);
            particle.y = (this.halfHeight - Defines.shipHalfRealSize) + (Math.random() * Defines.shipRealSize);
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
        const shot = {
            x: 0, // x-coordinate
            y: 0, // y-coordinate
            vx: 0, // x-velocity
            vy: 0, // y-velocity
            ax: 0, // x-acceleration
            ay: 0, // y-acceleration
            d: 0  // rotation (in degrees)
        };

        // Center the shot under the ship
        shot.x = this.halfWidth - Defines.shotHalfSize;
        shot.y = this.halfHeight - Defines.shotHalfSize;
        shot.ay = 2;

        return shot;
    } //new_shot()

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    private shotsplosion(shot: { vx: number; vy: number; }, rock: { vx: number; vy: number; }) {
        for (let l = 0; l < Defines.shipRealSize * 2 * this.particleMultiplier; l++) {
            const particle = new Particle();
            particle.x = (this.halfWidth - Defines.shotHalfWidth) + (Math.random() * Defines.shotWidth);
            particle.y = (this.halfHeight - Defines.shotHalfHeight) + (Math.random() * Defines.shotHeight);
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
                            this.player.ship.cd = this.shotCD;
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
            this.player.ship.cd = this.shotCD;
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
            this.stars.push(new Star(this.bigAxis, this.width, this.height, this.speedHack));
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
                if (this.rocks[i].cx < 0 - Defines.maxRockSize / 2
                    || this.rocks[i].cx > this.width + Defines.maxRockSize / 2
                    || this.rocks[i].cy < 0 - Defines.maxRockSize / 2
                    || this.rocks[i].cy > this.height + Defines.maxRockSize / 2) { //if
                    this.rocks.splice(i, 1);
                    this.rockCount--;
                } //fi
            } //done
        } else {
            // Remove asteroids when they leave the screen
            for (let i = 0; i < this.rockCount; i++) {
                if (this.rocks[i].cx < 0 - Defines.maxRockSize / 2
                    || this.rocks[i].cx > this.width + Defines.maxRockSize / 2
                    || this.rocks[i].cy < 0 - Defines.maxRockSize / 2
                    || this.rocks[i].cy > this.height + Defines.maxRockSize / 2) { //if
                    this.rocks.splice(i, 1);
                    this.rockCount--;
                } //fi
            } //done
        } //fi

        // Add asteroids if there aren't enough.  Never add more than 1/4 the desired asteroids at once.
        for (let i = 0; i < this.wantRocks / 4 && this.rockCount < this.wantRocks; i++) { //if
            // Set unconfigurable variables
            this.rocks.push(new Rock(this.player, this.width, this.height));
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
            for (let j = 0; j < Defines.rockPoints; j++) {
                //              Center         Angle formula                                  Rotation                           Radius           Resizing formula
                this.rocks[i].x[j] = this.rocks[i].cx + (Math.sin((j * ((Math.PI * 2) / Defines.rockPoints)) + (this.rocks[i].d * (Math.PI / 180)))) * (this.rocks[i].r[j] * (0.75 + ((this.wantRocks - i) / (this.wantRocks * 6))));
                this.rocks[i].y[j] = this.rocks[i].cy + (Math.cos((j * ((Math.PI * 2) / Defines.rockPoints)) + (this.rocks[i].d * (Math.PI / 180)))) * (this.rocks[i].r[j] * (0.75 + ((this.wantRocks - i) / (this.wantRocks * 6))));
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
                this.player.ship.vy += Defines.shipFullThrust;
            if (this.leftDown)
                this.player.ship.vd += Defines.shipSpinThrust;
            if (this.downDown)
                this.player.ship.vy -= Defines.shipMonoThrust;
            if (this.rightDown)
                this.player.ship.vd -= Defines.shipSpinThrust;
            this.player.ship.vr = this.player.ship.vd * (Math.PI / 180);

            // Calculate heat
            if (this.upDown) {
                if (this.player.ship.h < 1)
                    this.player.ship.h += Defines.thrustHeat;
                else this.player.ship.h = 1;
            } else {
                if (this.player.ship.h > Defines.thrustHeat)
                    this.player.ship.h -= Defines.thrustHeat;
                else this.player.ship.h = 0;
            } //fi

            // Create exhaust particles
            if (this.upDown) {
                for (let i = 0; i < 6 * this.particleMultiplier; i++) {
                    const particle = new Particle();
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
                    const particle = new Particle();
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
                    const particle = new Particle();
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
                    const particle = new Particle();
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
                    this.particles[i].rgba.a *= Defines.debrisFade;
                    break;

                case 1:
                    this.particles[i].rgba.a *= Defines.monoFade;
                    break;

                case 2:
                case 3:
                    this.particles[i].rgba.a *= Defines.thrustFade;
                    break;

                default:
                    this.particles[i].rgba.a *= Defines.debrisFade;
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
                const cos = Math.cos(radians);
                const sin = Math.sin(radians);
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
                const cos = Math.cos(radians);
                const sin = Math.sin(radians);
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
                const cos = Math.cos(radians);
                const sin = Math.sin(radians);
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
                const cos = Math.cos(radians);
                const sin = Math.sin(radians);
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
                if (this.halfWidth - Defines.shipHalfRealSize <= this.particles[i].x
                    && this.halfWidth + Defines.shipHalfRealSize >= this.particles[i].x
                    && this.halfHeight - Defines.shipHalfRealSize <= this.particles[i].y
                    && this.halfHeight + Defines.shipHalfRealSize >= this.particles[i].y) { //if
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
        // const rockOffset = rockCount / 3;
        for (let i = 0; i < this.rockCount; i++) {

            // Get the average size of the asteroid
            let avgSize1 = this.rocks[i].r[0];
            let smallSize1 = this.rocks[i].r[0];
            for (let j = 1; j < Defines.rockPoints; j++) {
                avgSize1 += this.rocks[i].r[j];
                if (this.rocks[i].r[j] < smallSize1)
                    smallSize1 = this.rocks[i].r[j];
            } //done
            avgSize1 /= Defines.rockPoints;
            const halfSize1 = avgSize1;
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
                        for (let j = 0; j < Defines.rockPoints; j++) {
                            avgSize2 += this.rocks[l].r[j];
                        } //done
                        avgSize2 /= Defines.rockPoints;
                        const halfSize2 = avgSize2;
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

                        // // This way is technically accurate, but absolutely ridiculously computationally intensive.  My laptop can't run it.
                        // } else {
                        //     for (let j = 0; j < rockPoints; j++) {
                        //         for (let k = 0; k < rockPoints; k++) {
                        //             for (let m = 0; m < rockPoints; m++) {
                        //                 for (let n = 0; n < rockPoints; n++) {
                        //                     if (rocks[i].x[j] <= rocks[l].x[m] && rocks[i].x[k] >= rocks[l].x[n]
                        //                         && rocks[i].x[j] >= rocks[l].x[m] && rocks[i].x[k] <= rocks[l].x[n]
                        //                         && rocks[i].y[j] <= rocks[l].y[m] && rocks[i].y[k] >= rocks[l].y[n]
                        //                         && rocks[i].y[j] >= rocks[l].y[m] && rocks[i].y[k] <= rocks[l].y[n]) { //if
                        //                         rocksplosion(rocks[i]);
                        //                         rocksplosion(rocks[l]);
                        //                         rocks.splice(i, 1);
                        //                         rocks.splice(l, 1);
                        //                         i -= 2;
                        //                         rockCount -= 2;
                        //                     } //fi
                        //                 } //done
                        //             } //done
                        //         } //done
                        //     } //done
                        // } //fi
                    } //fi
                } //done
            } //fi
            // Vs ships
            let shipDead = false;
            if (this.menuIndex == 1 && this.rocks[i]) {
                for (let j = 0; j < Defines.rockPoints; j++) {
                    for (let k = 0; k < Defines.rockPoints; k++) {
                        if (this.rocks[i].x[j] <= this.halfWidth + Defines.shipHalfRealSize && this.rocks[i].x[k] >= this.halfWidth - Defines.shipHalfRealSize
                            && this.rocks[i].x[j] >= this.halfWidth - Defines.shipHalfRealSize && this.rocks[i].x[k] <= this.halfWidth + Defines.shipHalfRealSize
                            && this.rocks[i].y[j] <= this.halfHeight + Defines.shipHalfRealSize && this.rocks[i].y[k] >= this.halfHeight - Defines.shipHalfRealSize
                            && this.rocks[i].y[j] >= this.halfHeight - Defines.shipHalfRealSize && this.rocks[i].y[k] <= this.halfHeight + Defines.shipHalfRealSize) { //if
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
        this.context.fillStyle = 'rgba(0, 0, 0, 1)';
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
                this.context.fillStyle = 'rgba(255, 255, 255, ' + this.stars[i].rgba.a.toString() + ')';
                this.context.strokeStyle = 'rgba(' + this.stars[i].rgba.r.toString()
                    + ', ' + this.stars[i].rgba.g.toString()
                    + ', ' + this.stars[i].rgba.b.toString()
                    + ', ' + this.stars[i].rgba.a.toString()
                    + ')';
                this.context.beginPath();
                this.context.arc(this.stars[i].x, this.stars[i].y, this.stars[i].r, 0, 2 * Math.PI, false);
                this.context.closePath();
                this.context.fill();
                this.context.stroke();
            } //fi
        } //done

        // Draw missiles
        for (let i = 0; i < this.shotCount; i++) {
            // context.drawImage(
            //     graphics.shot,                            // Image to use
            //     0,                                        // x-origin (frame)
            //     shotSize * Math.floor(360 - shots[i].d),  // y-origin (frame)
            //     shotSize,                                 // width    (frame)
            //     shotSize,                                 // height   (frame)
            //     shots[i].x - shotHalfSize,                // x-origin (canvas)
            //     shots[i].y - shotHalfSize,                // y-origin (canvas)
            //     shotSize,                                 // width    (canvas)
            //     shotSize                                  // height   (canvas)
            // );
            // context.(graphics.shot, shots[i].x, shots[i].y, shotSize, shotSize);
        } //done

        // Draw missile particles
        for (let i = 0; i < this.particleCount; i++) {
            if (this.particles[i].type == 3) {
                this.context.fillStyle = 'rgba(' + this.particles[i].rgba.r.toString()
                    + ', ' + this.particles[i].rgba.g.toString()
                    + ', ' + this.particles[i].rgba.b.toString()
                    + ', ' + this.particles[i].rgba.a.toString()
                    + ')'
                this.context.beginPath();
                this.context.arc(this.particles[i].x, this.particles[i].y, Defines.particleSize, 0, 2 * Math.PI, false);
                this.context.closePath();
                this.context.fill();
            } //fi
        } //done

        // Draw spaceship
        if (this.menuIndex == 1) {
            this.context.drawImage(this.graphics.ship, (this.width - Defines.shipSize) / 2, (this.height - Defines.shipSize) / 2, Defines.shipSize, Defines.shipSize);
            this.context.globalAlpha = this.player.ship.h;
            this.context.drawImage(this.graphics.shipHot, (this.width - Defines.shipSize) / 2, (this.height - Defines.shipSize) / 2, Defines.shipSize, Defines.shipSize);
            this.context.globalAlpha = 1;
        } //fi

        // Draw non-missile particles
        for (let i = 0; i < this.particleCount; i++) {
            if (this.particles[i].type != 3) {
                this.context.fillStyle = 'rgba(' + this.particles[i].rgba.r.toString()
                    + ', ' + this.particles[i].rgba.g.toString()
                    + ', ' + this.particles[i].rgba.b.toString()
                    + ', ' + this.particles[i].rgba.a.toString()
                    + ')'
                this.context.beginPath();
                this.context.arc(this.particles[i].x, this.particles[i].y, Defines.particleSize, 0, 2 * Math.PI, false);
                this.context.closePath();
                this.context.fill();
            } //fi
        } //done

        // Draw asteroids
        this.context.strokeStyle = 'rgba(0, 0, 0, 0.5)';  // Shadow
        for (let i = 0; i < this.rockCount; i++) {

            // Calculate spritesheet frame
            let degrees = this.rocks[i].d;
            if (degrees < 0) degrees += 360;

            // Set asteroid fill
            if (!this.useTextures) {
                this.context.fillStyle = 'rgba(' + this.rocks[i].rgba.r.toString()
                    + ', ' + this.rocks[i].rgba.g.toString()
                    + ', ' + this.rocks[i].rgba.b.toString()
                    + ', 1)';
            } //fi

            // Draw asteroids
            if (this.useTextures)
                this.context.save();
            this.context.beginPath();
            let cx = 0;
            let cy = 0;
            for (let j = 0; j < Defines.rockPoints; j++) {
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
            cx = Math.round(cx / Defines.rockPoints);
            cy = Math.round(cy / Defines.rockPoints);
            this.context.closePath();
            if (this.useTextures) {
                this.context.clip();
                this.context.drawImage(
                    this.graphics.rock,                               // Image to use
                    0,                                           // x-origin (frame)
                    Defines.rockSpriteSize * Math.floor(360 - degrees),  // y-origin (frame)
                    Defines.rockSpriteSize,                              // width    (frame)
                    Defines.rockSpriteSize,                              // height   (frame)
                    this.rocks[i].cx - (Defines.maxRockSize / 2),             // x-origin (canvas)
                    this.rocks[i].cy - (Defines.maxRockSize / 2),             // y-origin (canvas)
                    Defines.maxRockSize,                                 // width    (canvas)
                    Defines.maxRockSize                                  // height   (canvas)
                );
                this.context.restore();
            } //fi
            if (!this.useTextures)
                this.context.fill();
            this.context.fillStyle = 'rgba(0, 0, 0, ' + this.rocks[i].rgba.a.toString() + ')';
            this.context.fill();
            this.context.stroke();
        } //done

        //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

        // Draw GUI
        switch (this.menuIndex) {

            case 0:  // Main menu
                this.context.strokeStyle = 'rgba(255, 255, 255, 255)';
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
        // // Sounds
        // switch (menuIndex) {
        //     case 1:
        //         // Monopropellant
        //         const soundCutOff = sounds.mono.duration - (gameInt / 500);
        //         if (!downDown && !rightDown && !leftDown)
        //             sounds.mono.pause();
        //         if (downDown || rightDown || leftDown)
        //             sounds.mono.play();
        //         if (sounds.mono.currentTime > soundCutOff)
        //             sounds.mono.currentTime -= soundCutOff;
        //         // Thruster
        //         const soundCutOff = sounds.thrust.duration - (gameInt / 500);
        //         if (!upDown)
        //             sounds.thrust.pause();
        //         if (upDown)
        //             sounds.thrust.play();
        //         if (sounds.thrust.currentTime > soundCutOff)
        //             sounds.thrust.currentTime -= soundCutOff;
        //         // Ambience
        //         const soundCutOff = sounds.ship.duration - (gameInt / 500);
        //         if (sounds.ship.currentTime > soundCutOff)
        //             sounds.ship.currentTime -= soundCutOff;
        //         break;
        //     case 0:
        //     case 2:
        //         sounds.mono.pause();
        //         sounds.mono.currentTime = 0;
        //         sounds.thrust.pause();
        //         sounds.thrust.currentTime = 0;
        // } //esac

        //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //

        // Modify cooldown timers
        if (this.player.ship.cd >= Defines.gameSecs)
            this.player.ship.cd -= Defines.gameSecs;
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
                    this.player.score += 1 / Defines.gameInt;
                else this.player.score += 2 / Defines.gameInt;
            } else this.player.score += 4 / Defines.gameInt;
            document.getElementById('scoreSpan').innerHTML = Math.floor(this.player.score).toString();
        } //fi

    } //haxteroidsGameLoop()

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    // Settings

    public slideParticles() {
        const value: number = Number.parseInt((document.getElementById('particleSlider') as HTMLInputElement).value);

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
                document.getElementById('particleSpan').innerHTML = 'Off';
                break;
            case 1:
                document.getElementById('particleSpan').innerHTML = 'Low';
                break;
            case 2:
                document.getElementById('particleSpan').innerHTML = 'High';
                break;
        } //esac

    } //slideParticles()

    public slideStars() {
        const value: number = Number.parseInt((document.getElementById('starSlider') as HTMLInputElement).value);

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
                star = new Star(this.bigAxis, this.width, this.height, this.speedHack);
                star.x = (this.bigAxis * -0.5) + (Math.random() * this.bigAxis * 2.0);
                star.y = (this.bigAxis * -0.5) + (Math.random() * this.bigAxis * 2.0);
                this.stars.push(star);
                this.starCount++;
            } //done
        } else {
            for (let i = this.starCount; i < this.wantStars; i++) {
                star = new Star(this.bigAxis, this.width, this.height, this.speedHack);
                star.x = Math.random() * this.width;
                star.y = Math.random() * this.height;
                this.stars.push(star);
                this.starCount++;
            } //done
        } //fi

        // Update setting-label
        switch (value) {
            case 0:
                document.getElementById('starSpan').innerHTML = 'Off';
                break;
            case 1:
                document.getElementById('starSpan').innerHTML = 'Low';
                break;
            case 2:
                document.getElementById('starSpan').innerHTML = 'Medium';
                break;
            case 3:
                document.getElementById('starSpan').innerHTML = 'High';
                break;
        } //esac

    } //slideStars()

    public toggleTextures() {
        const checked: boolean = (document.getElementById('texturesToggle') as HTMLInputElement).checked;
        this.useTextures = checked;
    } //textureToggle()

    public toggleRockCollision() {
        const checked: boolean = (document.getElementById('rockCollisionToggle') as HTMLInputElement).checked;
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
        const checked: boolean = (document.getElementById('speedHackToggle') as HTMLInputElement).checked;
        this.speedHack = checked;
        this.slideStars();
    } //rockCollision()

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    // Infobox

    public showPremise() {
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('settings').style.display = 'none';  // Is most likely to be the previous screen, so should be done next-to-last.
        document.getElementById('premise').style.display = 'block';  // Is being unhidden, so should be done last.
    } //showPremise()

    public showInstructions() {
        document.getElementById('settings').style.display = 'none';
        document.getElementById('premise').style.display = 'none';        // Is most likely to be the previous screen, so should be done next-to-last.
        document.getElementById('instructions').style.display = 'block';  // Is being unhidden, so should be done last.
    } //showInstructions()

    public showSettings() {
        document.getElementById('premise').style.display = 'none';
        document.getElementById('instructions').style.display = 'none';  // Is most likely to be the previous screen, so should be done next-to-last.
        document.getElementById('settings').style.display = 'block';     // Is being unhidden, so should be done last.
    } //showSettings()
}
