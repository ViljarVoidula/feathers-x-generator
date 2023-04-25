# Setup

## Config

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