import { Hono } from "hono";

export const Health = new Hono();

Health.get("", (c)=>{
    return c.json({
        msg : "The Backend is Healthy"
    })
})
