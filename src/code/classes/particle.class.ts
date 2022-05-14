import { RGBA } from "./rgba.class";

////////////////////////////////////////////////////////////////////////////////
export enum ParticleType {
    debris = 0,
    mono   = 1,
    thrust = 2,
    shot   = 3,
}

////////////////////////////////////////////////////////////////////////////////
export class Particle {
    public x = 0;
    public y = 0;
    public vx = 0;
    public vy = 0;
    public rgba = new RGBA();
    public type: ParticleType = ParticleType.debris;
}
