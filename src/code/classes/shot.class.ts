import { Defines } from "defines.const";

////////////////////////////////////////////////////////////////////////////////
export class Shot {
    /** x-coordinate */
    public x: number = 0;
    /** y-coordinate */
    public y: number = 0;
    /** x-velocity */
    public vx: number = 0;
    /** y-velocity */
    public vy: number = 0;
    /** x-acceleration */
    public ax: number = 0;
    /** y-acceleration */
    public ay: number = 0;
    /** rotation (in degrees) */
    public d: number = 0;

    ////////////////////////////////////////////////////////////////////////////////
    constructor(
        private readonly halfWidth: number,
        private readonly halfHeight: number,
    ) {
        // Center the shot under the ship
        this.x = this.halfWidth - Defines.shotHalfSize;
        this.y = this.halfHeight - Defines.shotHalfSize;
        this.ay = 2;

        return this;
    }
}
