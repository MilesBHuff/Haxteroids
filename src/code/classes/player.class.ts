import { Ship } from "./ship.class";

////////////////////////////////////////////////////////////////////////////////
export class Player {
    public ship = new Ship();

    public score = 0;
    public shotsFired? = 0;
    public rocksBroken? = 0;
    public timePlayed? = 0;
    public timesDied? = 0;
}
