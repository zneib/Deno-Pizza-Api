import { Application, Context, helpers, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { getAllUsers, getUserById, getAllPizzas, upsertUser, upsertPizza, deletePizzaById } from "./db.ts";

const { getQuery } = helpers;
const router = new Router();

router
  .get("/users", async (ctx: Context) => {
    ctx.response.body = await getAllUsers();
  })
  .get("/users/:id", async (ctx: Context) => {
    const { id } = getQuery(ctx, { mergeParams: true });
    ctx.response.body = await getUserById(id);
  })
  .get("/pizzas", async (ctx: Context) => {
    ctx.response.body = await getAllPizzas();
  })
  .post("/users", async (ctx: Context) => {
    const body = ctx.request.body();
    const user = await body.value;
    await upsertUser(user);
  })
  .post("/pizzas", async (ctx: Context) => {
    const body = ctx.request.body();
    const user = await body.value;
    await upsertPizza(user);
  })
  .delete("/pizzas/:id", async (ctx: Context) => {
    const { id } = getQuery(ctx, { mergeParams: true });
    await deletePizzaById(id);
  })

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });