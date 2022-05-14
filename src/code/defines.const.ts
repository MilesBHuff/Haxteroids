////////////////////////////////////////////////////////////////////////////////
export class Defines {

    // Game variables
    public static readonly gameInt: number = 1000 / 60;
    public static readonly gameSecs: number = Defines.gameInt / 1000;

    // Star variables
    public static readonly maxStarSize: number = 0.05;
    public static readonly starIVX: number = 1.0 - (Math.random() * 2.0);
    public static readonly starIVY: number = 1.0 - (Math.random() * 2.0);
    public static readonly starSpeed: number = 0.1625;

    // Asteroid variables
    public static readonly rockPoints: number = 11;  // Too many sides generates asteroids that are too spiky, and too few generates asteroids that are too alike.  Using a prime number helps prevent symmetry.
    public static readonly rockSpriteSize: number = 128;
    public static readonly maxRockSize: number = 128;
    public static readonly minRockSize: number = Defines.maxRockSize / 4;
    public static readonly maxRockSpeed: number = 1.0;
    public static readonly minRockSpeed: number = Defines.maxRockSpeed / 4;
    public static readonly maxRockSpin: number = 1.0;

    // Missile variables
    public static readonly shotSize: number = 16;
    public static readonly shotHalfSize: number = Defines.shotSize / 2;
    public static readonly shotWidth: number = NaN; //TODO
    public static readonly shotHalfWidth: number = Defines.shotWidth / 2;
    public static readonly shotHeight: number = NaN; //TODO
    public static readonly shotHalfHeight: number = Defines.shotHeight / 2;

    // Ship variables
    public static readonly shipSize: number = 32;
    public static readonly shipRealSize: number = 30;
    public static readonly shipHalfRealSize: number = Defines.shipRealSize / 2;
    public static readonly shipFullThrust: number = 0.0625;
    public static readonly shipMonoThrust: number = Defines.shipFullThrust / 2;
    public static readonly shipSpinThrust: number = 0.0078125;
    public static readonly thrustHeat: number = 0.0125;

    // Particle variables
    public static readonly particleSize: number = 1
    public static readonly monoFade: number = 0.5;  // Multiplier
    public static readonly thrustFade: number = 0.67;  // Multiplier
    public static readonly debrisFade: number = 0.9999;  // Multiplier
}
