////////////////////////////////////////////////////////////////////////////////
export class Ship {

    /** Heat */
    public h: number  = 0;

    /** Vertical velocity */
    public vy: number = 0;
    /** Rotational velocity, degrees */
    public vd: number = 0;
    /** Rotational velocity, radians */
    public vr: number = 0;

    /** Missile cooldown timer */
    public cd: number = 0;
}
