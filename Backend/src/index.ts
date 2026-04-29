import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { IndexRouter } from "./routes";
import { GameState, StartGameInput } from "./chess/types";
import { createInitialBoard } from "./chess/setup";
import { GameError, toRpcFailure , toRpcSuccess} from "./chess/errors";

interface Env {
    ChessGame : DurableObjectNamespace<ChessGame>
}

const app = new Hono<{Bindings: Env}>

app.use('/api/v1/*', cors())
app.use('/api/v1/*', async(c, next)=>{

    const gameId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    const stub = c.env.ChessGame.getByName(gameId);
    // create a 1 Durable object corresponding to a Game
    await stub.initializeGame({gameId , playerId});
    console.log(await stub.getGameState());
    await next();
})
app.route('/api/v1', IndexRouter);


export class ChessGame extends DurableObject<Env> {
    private gameState : GameState | null = null;
    private readonly isGameStateReady : Promise<void>;
    constructor( ctx : DurableObjectState, env : Env){
        super(ctx,env);
        this.isGameStateReady = this.loadState();
    }

    async loadState() : Promise<void>{
        const stored = await this.ctx.storage.get<GameState>("game_state");
        this.gameState = stored ?? null;
    }
    async initializeGame(input : StartGameInput) {
        try{
            await this.isGameStateReady;
            if(this.gameState){
                // if a game already exists, do not let user create another game;
                throw new GameError(409,"Game_Exists","This Game already exists !");
            }

            this.gameState = {
                gameId : input.gameId,
                board: createInitialBoard()
            }

            await this.SaveState();

            return toRpcSuccess( this.gameState );

        }
        catch(e){
            return toRpcFailure(e);
        }
    }

    // Make sure we have a game state, then save it.
    async SaveState(): Promise<void>{
        if(!this.gameState){
            throw new GameError(404,"game_not_found","Gane state was not found");
        }

        await this.ctx.storage.put("game_state", this.gameState);


    }

    async getGameState() : Promise<GameState | undefined>{
        const res = await this.ctx.storage.get<GameState>("game_state");
        return res;
    }
}

export default app;
