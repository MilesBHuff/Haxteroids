import { Defines } from 'defines.const';
import { Player } from './player.class';
import { RGBA } from './rgba.class';

////////////////////////////////////////////////////////////////////////////////
export class Rock {

    /** Center x */
    public cx = 0;
    /** x-velocity */
    public vx = 0;
    /** xs */
    public x = new Array();

    /** Center y */
    public cy = 0;
    /** y-velocity */
    public vy = 0;
    /** ys */
    public y = new Array();

    /** Radiuses */
    public r = new Array();

    /** Facing */
    public d = 0;
    /** Spin */
    public vd = 0;

    /** Initial color */
    public irgba = new RGBA();
    /** Color */
    public rgba = new RGBA();

    ////////////////////////////////////////////////////////////////////////////////
    constructor(
        private player: Player,
        private width: number,
        private height: number,
    ) {

		// Generate color
		this.irgba.r = 114 - (Math.random() * 3);
		this.irgba.g = 111 - (Math.random() * 5);
		this.irgba.b = 106 - (Math.random() * 7);

		// Calculate radiuses
		const rockSize = (Defines.minRockSize + (Math.random() * (Defines.maxRockSize - Defines.minRockSize)));
		const rockSizeThird = rockSize / 3;
		for (let j = 0; j < Defines.rockPoints; j++) {
			this.r.push(rockSizeThird + (Math.random() * ((rockSizeThird * 2) - rockSizeThird)));
		} //done

		// Initialize coordinates
		for (let j = 0; j < Defines.rockPoints; j++) {
			this.x.push(0);
			this.y.push(0);
		} //done

		// Set velocities
		this.vd = Math.random() * Defines.maxRockSpin;
		const offsetRockSpeed = Defines.maxRockSpeed - Defines.minRockSpeed;
		this.vx = Defines.minRockSpeed + (Math.random() * offsetRockSpeed);
		this.vy = Defines.minRockSpeed + (Math.random() * offsetRockSpeed);

		// Allow negative velocities
		if (Math.round(Math.random()) == 0)
			this.vd *= -1;
		if (Math.round(Math.random()) == 0)
			this.vx *= -1;
		if (Math.round(Math.random()) == 0)
			this.vy *= -1;

		// Set positions
		this.d = Math.random() * 360;
		// 'Even' means we generate the rock with a static y-axis
		if (Math.round(Math.random()) == 0) {
			this.cx = Math.random() * (this.width + (2 * rockSize));

			// If the y-velocity is positive, start the rock on the top
			if (this.vy + this.player.ship.vy > 0)
				this.cy = (0 - rockSize);

			// If the y-velocity is negative, start the rock on the bottom
			else this.cy = (this.height + rockSize);

			// 'Odd' means we generate the rock with a static x-axis
		} else {
			this.cy = Math.random() * (this.height + (2 * rockSize));

			// If the x-velocity is positive, start the rock on the left
			if (this.vx > 0)
				this.cx = (0 - rockSize);

			// If the x-velocity is negative, start the rock on the right
			else this.cx = (this.width + rockSize);
		} //fi

		return this;
    }
}
