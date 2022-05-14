import { Defines } from 'defines.const';
import { RGBA } from './rgba.class';

////////////////////////////////////////////////////////////////////////////////
export class Star {

    /** Radius */
    public r = 0;
    /** Diameter */
    public dia = 0;

    /** Center x */
    public x = 0;
    /** Center y */
    public y = 0;
    /** Distance */
    public z = 0;

    /** x-velocity */
    public vx = 0;
    /** y-velocity */
    public vy = 0;

    /** Color */
    public rgba = new RGBA();

    ////////////////////////////////////////////////////////////////////////////////
    constructor(
        private readonly bigAxis: number,
        private readonly width: number,
        private readonly height: number,
        private readonly speedHack: boolean,
    ) {

		// Generate more-or-less scientifically accurate star-data
		// I used https://en.wikipedia.org/wiki/Stellar_classification#Harvard_spectral_classification
		// to get the percentages, colors (RGB), luminosities (alpha), and sizes (radius).  As the
		// Wikipedia percentages did not add up to 100, I scaled them.  I also scaled the luminosities.
		this.rgba.a = Math.random();  // This is a temporary setting used to determine the stellar spectral class of the star
		// Class M
		if (this.rgba.a <= 0.765418272300) {
			this.rgba.r = 255;
			this.rgba.g = 189;
			this.rgba.b = 111;
			this.rgba.a = Math.round(0.5 + (Math.random() * 0.027));  // 0.527 - 0.5
			this.r = Defines.maxStarSize * (0 + (Math.random() * 0.7));  // 0.7   - 0
		} else   // Class K
			if (this.rgba.a <= 0.886563610363) {
				this.rgba.r = 255;
				this.rgba.g = 221;
				this.rgba.b = 180;
				this.rgba.a = Math.round(0.527 + (Math.random() * 0.2));  // 0.727 - 0.527
				this.r = Defines.maxStarSize * (0.7 + (Math.random() * 0.26));  // 0.96  - 0.7
			} else   // Class G
				if (this.rgba.a <= 0.962654897080) {
					this.rgba.r = 255;
					this.rgba.g = 244;
					this.rgba.b = 232;
					this.rgba.a = Math.round(0.727 + (Math.random() * 0.273));  // 1     - 0.727
					this.r = Defines.maxStarSize * (0.96 + (Math.random() * 0.19));  // 1.15  - 0.96
				} else   // Class F
					if (this.rgba.a <= 0.992690931310) {
						this.rgba.r = 251;
						this.rgba.g = 248;
						this.rgba.b = 255;
						this.rgba.a = 1;
						//		this.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
						this.r = Defines.maxStarSize * (1.15 + (Math.random() * 0.25));  // 1.4   - 1.15
					} else   // Class A
						if (this.rgba.a <= 0.998698138156) {
							this.rgba.r = 202;
							this.rgba.g = 216;
							this.rgba.b = 255;
							this.rgba.a = 1;
							//		this.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
							this.r = Defines.maxStarSize * (1.4 + (Math.random() * 0.4));  // 1.8   - 1.4
						} else   // Class B
							if (this.rgba.a <= 0.999996996400) {
								this.rgba.r = 170;
								this.rgba.g = 191;
								this.rgba.b = 255;
								this.rgba.a = 1;
								//		this.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
								this.r = Defines.maxStarSize * (1.8 + (Math.random() * 4.8));  // 6.6   - 1.8
							} else { // Class O
								this.rgba.r = 155;
								this.rgba.g = 176;
								this.rgba.b = 255;
								this.rgba.a = 1;
								//		this.rgba.a = Math.round(    1     + (Math.random() * 0    ));  // 1     - 1
								this.r = Defines.maxStarSize * 6.6;
								//		this.r      = maxStarSize * (6.6   + (Math.random() * 0    ));  // 6.6   - 6.6
							} //fi

		// Calculate star speed and apply distance to speed and luminosity
		this.z = 6 * Math.random();
		this.vx = this.z * Defines.starSpeed * Defines.starIVX;
		this.vy = this.z * Defines.starSpeed * Defines.starIVY;
		this.r *= this.z;
		this.dia = this.r * 2;
		this.rgba.a *= this.z / 6;

		// 'Even' means we generate the star with a static x-axis
		if (Math.round(Math.random()) == 0) {
			if (!this.speedHack)
				this.x = (this.bigAxis * -0.5) + (Math.random() * (this.bigAxis * 2.0));
			else this.x = Math.random() * (this.width + (2 * this.r));

			// 'Even' means we generate the star on the top
			if (Math.round(Math.random()) == 0) {
				if (!this.speedHack)
					this.y = this.bigAxis * -0.5;
				else this.y = 0 - this.r;

				// 'Odd' means we generate the star on the bottom
			} else {
				if (!this.speedHack)
					this.y = this.bigAxis * 1.5;
				else this.y = (this.height + this.r);
			} //fi

			// 'Odd' means we generate the star with a static y-axis
		} else {
			if (!this.speedHack)
				this.y = (this.bigAxis * -0.5) + (Math.random() * (this.bigAxis * 2.0));
			else this.y = Math.random() * (this.height + (2 * this.r));

			// 'Even' means we generate the star on the left
			if (Math.round(Math.random()) == 0) {
				if (!this.speedHack)
					this.x = this.bigAxis * -0.5;
				else this.x = (0 - this.r);

				// 'Odd' means we generate the star on the right
			} else {
				if (!this.speedHack)
					this.x = this.bigAxis * 1.5;
				else this.x = (this.width + this.r);
			} //fi
		} //fi

		return this;
	} //constructor()
}
