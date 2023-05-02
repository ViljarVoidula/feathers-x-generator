# Setup

## Config
### Koa
First add imports to your feathers app like that
```ts
//!code graphql_schema_imports start
import { createYoga } from 'graphql-yoga';
import { EnvelopArmor } from '@escape.tech/graphql-armor';
import { schema } from './graphql';
//!code graphql_schema_imports end
```
Then follow it by  setting up your graphql yoga server middleware 

```ts
//!code: yoga start
const armor = new EnvelopArmor();
const protection = armor.protect()
const yoga = createYoga<Koa.ParameterizedContext>({
  graphiql: true,
  plugins: [...protection.plugins],
  maskedErrors: false,
  schema
});

app.use(async (ctx, next) => {
  if (/\/graphql.*/.test(ctx.req.url as string)) {
    // Second parameter adds Koa's context into GraphQL Context
    const response = await yoga.handleNodeRequest(ctx.req, ctx);

    // Set status code
    ctx.status = response.status;

    // Set headers
    response.headers.forEach((value, key) => {
      ctx.append(key, value);
    });

    // Converts ReadableStream to a NodeJS Stream
    ctx.body = response.body;

  } else {
    await next();
  }
});
//!code: yoga end

```

## Run with Typescript


## Run with JS

# Q:A

**Q: *I got a field that i only want to resolve externally? How can i do it?***
**A:** In your service .graphql.ts where you expose schema to graphql builder do a custom type like in example below

```ts
export const extendedSchema: TSchema = Type.Intersect([
  carSchema.schema,
  Type.Object({
    // key_field is important for Refs, if key_field is missing generator will break
    owner: Type.Ref(ownerSchema.schema, { key_field: 'owner_id' }),
  }),
], { $id: 'Car' });
```