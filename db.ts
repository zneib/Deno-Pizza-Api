export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}

export interface Pizza {
  id: string;
  name: string;
}

const kv = await Deno.openKv();

export async function getAllUsers() {
  const users = [];
  for await (const res of kv.list({ prefix: ["user" ]})) {
    users.push(res.value);
  }
  return users;
}

export async function getAllPizzas() {
  const pizzas = [];
  for await (const res of kv.list({ prefix: ["pizza" ]})) {
    pizzas.push(res.value);
  }
  return pizzas;
}

export async function getUserById(id: string): Promise<User> {
  const key = ["user", id];
  return (await kv.get<User>(key)).value!;
}

export async function upsertUser(user: User) {
  const userKey = ["user", user.id];
  const userByEmailKey = ["user_by_email", user.email];

  const oldUser = await kv.get<User>(userKey);

  if (!oldUser.value) {
    const ok = await kv.atomic()
      .check(oldUser)
      .set(userByEmailKey, user.id)
      .set(userKey, user)
      .commit();
      if (!ok) throw new Error("Something went wrong.");
  } else {
    const ok = await kv.atomic()
      .check(oldUser)
      .delete(["user_by_email", oldUser.value.email])
      .set(userByEmailKey, user.id)
      .set(userKey, user)
      .commit();
      if (!ok) throw new Error("Something went wrong.");
  }
}

export async function upsertPizza(pizza: Pizza) {
  const pizzaKey = ["pizza", pizza.id];
  
  const oldPizza = await kv.get<Pizza>(pizzaKey);
  if (!oldPizza.value) {
    const ok = await kv.atomic()
      .check(oldPizza)
      .set(pizzaKey, pizza)
      .commit();
      if (!ok) throw new Error("Something went wrong.")
  }
}