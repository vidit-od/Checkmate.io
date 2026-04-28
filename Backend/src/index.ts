import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { IndexRouter } from "./routes";

const app = new Hono<{Bindings: Env}>

app.use('/api/v1/*',cors());
app.route('/api/v1', IndexRouter);

export class MyDob extends DurableObject<Env> {
    constructor( ctx : DurableObjectState, env : Env){
        super(ctx,env)
    }

    async setValue(key:string, value: string) : Promise<string>{
        await this.ctx.storage.put(key,value);
        return "Stored!";
    }

    async getValue(key:string): Promise<string | null>{
        const value = await this.ctx.storage.get<string>(key) ?? null;
        return value ;
    }

    async health(){
        return "Hello"
    }
}

export default app;
