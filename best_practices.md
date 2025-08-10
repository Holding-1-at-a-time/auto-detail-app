---
description: Guidelines and best practices for building Convex projects, including database schema design, queries, mutations, and real-world examples
globs: **/*.ts,**/*.tsx,**/*.js,**/*.jsx
---

# Convex guidelines
## Function guidelines
### New function syntax
- ALWAYS use the new function syntax for Convex functions. For example:
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
export const f = query({
    args: {},
    returns: v.null(),
    handler: async (ctx, args) => {
    // Function body
    },
});
```

### Http endpoint syntax
- HTTP endpoints are defined in `convex/http.ts` and require an `httpAction` decorator. For example:
```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
const http = httpRouter();
http.route({
    path: "/echo",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
    const body = await req.bytes();
    return new Response(body, { status: 200 });
    }),
});
```
- HTTP endpoints are always registered at the exact path you specify in the `path` field. For example, if you specify `/api/someRoute`, the endpoint will be registered at `/api/someRoute`.

### Validators
- Below is an example of an array validator:
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
args: {
    simpleArray: v.array(v.union(v.string(), v.number())),
},
handler: async (ctx, args) => {
    //...
},
});
```
- Below is an example of a schema with validators that codify a discriminated union type:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    results: defineTable(
        v.union(
            v.object({
                kind: v.literal("error"),
                errorMessage: v.string(),
            }),
            v.object({
                kind: v.literal("success"),
                value: v.number(),
            }),
        ),
    )
});
```
- Always use the `v.null()` validator when returning a null value. Below is an example query that returns a null value:
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const exampleQuery = query({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
      console.log("This query returns a null value");
      return null;
  },
});
```
- Here are the valid Convex types along with their respective validators:
Convex Type  | TS/JS type  |  Example Usage         | Validator for argument validation and schemas  | Notes                                                                                                                                                                                                 |
| ----------- | ------------| -----------------------| -----------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Id          | string      | `doc._id`              | `v.id(tableName)`                              |                                                                                                                                                                                                       |
| Null        | null        | `null`                 | `v.null()`                                     | JavaScript's `undefined` is not a valid Convex value. Functions the return `undefined` or do not return will return `null` when called from a client. Use `null` instead.                             |
| Int64       | bigint      | `3n`                   | `v.int64()`                                    | Int64s only support BigInts between -2^63 and 2^63-1. Convex supports `bigint`s in most modern browsers.                                                                                              |
| Float64     | number      | `3.1`                  | `v.number()`                                   | Convex supports all IEEE-754 double-precision floating point numbers (such as NaNs). Inf and NaN are JSON serialized as strings.                                                                      |
| Boolean     | boolean     | `true`                 | `v.boolean()`                                  |
| String      | string      | `"abc"`                | `v.string()`                                   | Strings are stored as UTF-8 and must be valid Unicode sequences. Strings must be smaller than the 1MB total size limit when encoded as UTF-8.                                                         |
| Bytes       | ArrayBuffer | `new ArrayBuffer(8)`   | `v.bytes()`                                    | Convex supports first class bytestrings, passed in as `ArrayBuffer`s. Bytestrings must be smaller than the 1MB total size limit for Convex types.                                                     |
| Array       | Array]      | `[1, 3.2, "abc"]`      | `v.array(values)`                              | Arrays can have at most 8192 values.                                                                                                                                                                  |
| Object      | Object      | `{a: "abc"}`           | `v.object({property: value})`                  | Convex only supports "plain old JavaScript objects" (objects that do not have a custom prototype). Objects can have at most 1024 entries. Field names must be nonempty and not start with "$" or "_". |
| Record      | Record      | `{"a": "1", "b": "2"}` | `v.record(keys, values)`                       | Records are objects at runtime, but can have dynamic keys. Keys must be only ASCII characters, nonempty, and not start with "$" or "_".                                                               |

### Function registration
- Use `internalQuery`, `internalMutation`, and `internalAction` to register internal functions. These functions are private and aren't part of an app's API. They can only be called by other Convex functions. These functions are always imported from `./_generated/server`.
- Use `query`, `mutation`, and `action` to register public functions. These functions are part of the public API and are exposed to the public Internet. Do NOT use `query`, `mutation`, or `action` to register sensitive internal functions that should be kept private.
- You CANNOT register a function through the `api` or `internal` objects.
- ALWAYS include argument and return validators for all Convex functions. This includes all of `query`, `internalQuery`, `mutation`, `internalMutation`, `action`, and `internalAction`. If a function doesn't return anything, include `returns: v.null()` as its output validator.
- If the JavaScript implementation of a Convex function doesn't have a return value, it implicitly returns `null`.

### Function calling
- Use `ctx.runQuery` to call a query from a query, mutation, or action.
- Use `ctx.runMutation` to call a mutation from a mutation or action.
- Use `ctx.runAction` to call an action from an action.
- ONLY call an action from another action if you need to cross runtimes (e.g. from V8 to Node). Otherwise, pull out the shared code into a helper async function and call that directly instead.
- Try to use as few calls from actions to queries and mutations as possible. Queries and mutations are transactions, so splitting logic up into multiple calls introduces the risk of race conditions.
- All of these calls take in a `FunctionReference`. Do NOT try to pass the callee function directly into one of these calls.
- When using `ctx.runQuery`, `ctx.runMutation`, or `ctx.runAction` to call a function in the same file, specify a type annotation on the return value to work around TypeScript circularity limitations. For example,
```
export const f = query({
  args: { name: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    return "Hello " + args.name;
  },
});

export const g = query({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });
    return null;
  },
});
```

### Function references
- Function references are pointers to registered Convex functions.
- Use the `api` object defined by the framework in `convex/_generated/api.ts` to call public functions registered with `query`, `mutation`, or `action`.
- Use the `internal` object defined by the framework in `convex/_generated/api.ts` to call internal (or private) functions registered with `internalQuery`, `internalMutation`, or `internalAction`.
- Convex uses file-based routing, so a public function defined in `convex/example.ts` named `f` has a function reference of `api.example.f`.
- A private function defined in `convex/example.ts` named `g` has a function reference of `internal.example.g`.
- Functions can also registered within directories nested within the `convex/` folder. For example, a public function `h` defined in `convex/messages/access.ts` has a function reference of `api.messages.access.h`.

### Api design
- Convex uses file-based routing, so thoughtfully organize files with public query, mutation, or action functions within the `convex/` directory.
- Use `query`, `mutation`, and `action` to define public functions.
- Use `internalQuery`, `internalMutation`, and `internalAction` to define private, internal functions.

### Pagination
- Paginated queries are queries that return a list of results in incremental pages.
- You can define pagination using the following syntax:

```ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
export const listWithExtraArg = query({
    args: { paginationOpts: paginationOptsValidator, author: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
        .query("messages")
        .filter((q) => q.eq(q.field("author"), args.author))
        .order("desc")
        .paginate(args.paginationOpts);
    },
});
```
Note: `paginationOpts` is an object with the following properties:
- `numItems`: the maximum number of documents to return (the validator is `v.number()`)
- `cursor`: the cursor to use to fetch the next page of documents (the validator is `v.union(v.string(), v.null())`)
- A query that ends in `.paginate()` returns an object that has the following properties:
                            - page (contains an array of documents that you fetches)
                            - isDone (a boolean that represents whether or not this is the last page of documents)
                            - continueCursor (a string that represents the cursor to use to fetch the next page of documents)


## Validator guidelines
- `v.bigint()` is deprecated for representing signed 64-bit integers. Use `v.int64()` instead.
- Use `v.record()` for defining a record type. `v.map()` and `v.set()` are not supported.

## Schema guidelines
- Always define your schema in `convex/schema.ts`.
- Always import the schema definition functions from `convex/server`:
- System fields are automatically added to all documents and are prefixed with an underscore. The two system fields that are automatically added to all documents are `_creationTime` which has the validator `v.number()` and `_id` which has the validator `v.id(tableName)`.
- Always include all index fields in the index name. For example, if an index is defined as `["field1", "field2"]`, the index name should be "by_field1_and_field2".
- Index fields must be queried in the same order they are defined. If you want to be able to query by "field1" then "field2" and by "field2" then "field1", you must create separate indexes.

## Typescript guidelines
- You can use the helper typescript type `Id` imported from './_generated/dataModel' to get the type of the id for a given table. For example if there is a table called 'users' you can use `Id<'users'>` to get the type of the id for that table.
- If you need to define a `Record` make sure that you correctly provide the type of the key and value in the type. For example a validator `v.record(v.id('users'), v.string())` would have the type `Record<Id<'users'>, string>`. Below is an example of using `Record` with an `Id` type in a query:
```ts
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const exampleQuery = query({
    args: { userIds: v.array(v.id("users")) },
    returns: v.record(v.id("users"), v.string()),
    handler: async (ctx, args) => {
        const idToUsername: Record<Id<"users">, string> = {};
        for (const userId of args.userIds) {
            const user = await ctx.db.get(userId);
            if (user) {
                idToUsername[user._id] = user.username;
            }
        }

        return idToUsername;
    },
});
```
- Be strict with types, particularly around id's of documents. For example, if a function takes in an id for a document in the 'users' table, take in `Id<'users'>` rather than `string`.
- Always use `as const` for string literals in discriminated union types.
- When using the `Array` type, make sure to always define your arrays as `const array: Array<T> = [...];`
- When using the `Record` type, make sure to always define your records as `const record: Record<KeyType, ValueType> = {...};`
- Always add `@types/node` to your `package.json` when using any Node.js built-in modules.

## Full text search guidelines
- A query for "10 messages in channel '#general' that best match the query 'hello hi' in their body" would look like:

const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general"),
  )
  .take(10);

## Query guidelines
- Do NOT use `filter` in queries. Instead, define an index in the schema and use `withIndex` instead.
- Convex queries do NOT support `.delete()`. Instead, `.collect()` the results, iterate over them, and call `ctx.db.delete(row._id)` on each result.
- Use `.unique()` to get a single document from a query. This method will throw an error if there are multiple documents that match the query.
- When using async iteration, don't use `.collect()` or `.take(n)` on the result of a query. Instead, use the `for await (const row of query)` syntax.
### Ordering
- By default Convex always returns documents in ascending `_creationTime` order.
- You can use `.order('asc')` or `.order('desc')` to pick whether a query is in ascending or descending order. If the order isn't specified, it defaults to ascending.
- Document queries that use indexes will be ordered based on the columns in the index and can avoid slow table scans.


## Mutation guidelines
- Use `ctx.db.replace` to fully replace an existing document. This method will throw an error if the document does not exist.
- Use `ctx.db.patch` to shallow merge updates into an existing document. This method will throw an error if the document does not exist.

## Action guidelines
- Always add `"use node";` to the top of files containing actions that use Node.js built-in modules.
- Never use `ctx.db` inside of an action. Actions don't have access to the database.
- Below is an example of the syntax for an action:
```ts
import { action } from "./_generated/server";

export const exampleAction = action({
    args: {},
    returns: v.null(),
    handler: async (ctx, args) => {
        console.log("This action does not return anything");
        return null;
    },
});
```

## Scheduling guidelines
### Cron guidelines
- Only use the `crons.interval` or `crons.cron` methods to schedule cron jobs. Do NOT use the `crons.hourly`, `crons.daily`, or `crons.weekly` helpers.
- Both cron methods take in a FunctionReference. Do NOT try to pass the function directly into one of these methods.
- Define crons by declaring the top-level `crons` object, calling some methods on it, and then exporting it as default. For example,
```ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const empty = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log("empty");
  },
});

const crons = cronJobs();

// Run `internal.crons.empty` every two hours.
crons.interval("delete inactive users", { hours: 2 }, internal.crons.empty, {});

export default crons;
```
- You can register Convex functions within `crons.ts` just like any other file.
- If a cron calls an internal function, always import the `internal` object from '_generated/api', even if the internal function is registered in the same file.


## File storage guidelines
- Convex includes file storage for large files like images, videos, and PDFs.
- The `ctx.storage.getUrl()` method returns a signed URL for a given file. It returns `null` if the file doesn't exist.
- Do NOT use the deprecated `ctx.storage.getMetadata` call for loading a file's metadata.

                    Instead, query the `_storage` system table. For example, you can use `ctx.db.system.get` to get an `Id<"_storage">`.
```
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

type FileMetadata = {
    _id: Id<"_storage">;
    _creationTime: number;
    contentType?: string;
    sha256: string;
    size: number;
}

export const exampleQuery = query({
    args: { fileId: v.id("_storage") },
    returns: v.null(),
    handler: async (ctx, args) => {
        const metadata: FileMetadata | null = await ctx.db.system.get(args.fileId);
        console.log(metadata);
        return null;
    },
});
```
- Convex storage stores items as `Blob` objects. You must convert all items to/from a `Blob` when using Convex storage.


# Examples:
## Example: chat-app

### Task
```
Create a real-time chat application backend with AI responses. The app should:
- Allow creating users with names
- Support multiple chat channels
- Enable users to send messages to channels
- Automatically generate AI responses to user messages
- Show recent message history

The backend should provide APIs for:
1. User management (creation)
2. Channel management (creation)
3. Message operations (sending, listing)
4. AI response generation using OpenAI's GPT-4

Messages should be stored with their channel, author, and content. The system should maintain message order
and limit history display to the 10 most recent messages per channel.

```

### Analysis
1. Task Requirements Summary:
- Build a real-time chat backend with AI integration
- Support user creation
- Enable channel-based conversations
- Store and retrieve messages with proper ordering
- Generate AI responses automatically

2. Main Components Needed:
- Database tables: users, channels, messages
- Public APIs for user/channel management
- Message handling functions
- Internal AI response generation system
- Context loading for AI responses

3. Public API and Internal Functions Design:
Public Mutations:
- createUser:
  - file path: convex/index.ts
  - arguments: {name: v.string()}
  - returns: v.object({userId: v.id("users")})
  - purpose: Create a new user with a given name
- createChannel:
  - file path: convex/index.ts
  - arguments: {name: v.string()}
  - returns: v.object({channelId: v.id("channels")})
  - purpose: Create a new channel with a given name
- sendMessage:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels"), authorId: v.id("users"), content: v.string()}
  - returns: v.null()
  - purpose: Send a message to a channel and schedule a response from the AI

Public Queries:
- listMessages:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels")}
  - returns: v.array(v.object({
    _id: v.id("messages"),
    _creationTime: v.number(),
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
    }))
  - purpose: List the 10 most recent messages from a channel in descending creation order

Internal Functions:
- generateResponse:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels")}
  - returns: v.null()
  - purpose: Generate a response from the AI for a given channel
- loadContext:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels")}
  - returns: v.array(v.object({
    _id: v.id("messages"),
    _creationTime: v.number(),
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
  }))
- writeAgentResponse:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels"), content: v.string()}
  - returns: v.null()
  - purpose: Write an AI response to a given channel

4. Schema Design:
- users
  - validator: { name: v.string() }
  - indexes: <none>
- channels
  - validator: { name: v.string() }
  - indexes: <none>
- messages
  - validator: { channelId: v.id("channels"), authorId: v.optional(v.id("users")), content: v.string() }
  - indexes
    - by_channel: ["channelId"]

5. Background Processing:
- AI response generation runs asynchronously after each user message
- Uses OpenAI's GPT-4 to generate contextual responses
- Maintains conversation context using recent message history


### Implementation

#### package.json
```typescript
{
  "name": "chat-app",
  "description": "This example shows how to build a chat app without authentication.",
  "version": "1.0.0",
  "dependencies": {
    "convex": "^1.17.4",
    "openai": "^4.79.0"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

#### tsconfig.json
```typescript
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "exclude": ["convex"],
  "include": ["**/src/**/*.tsx", "**/src/**/*.ts", "vite.config.ts"]
}
```

#### convex/index.ts
```typescript
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";

/**
 * Create a user with a given name.
 */
export const createUser = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", { name: args.name });
  },
});

/**
 * Create a channel with a given name.
 */
export const createChannel = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id("channels"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("channels", { name: args.name });
  },
});

/**
 * List the 10 most recent messages from a channel in descending creation order.
 */
export const listMessages = query({
  args: {
    channelId: v.id("channels"),
  },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      channelId: v.id("channels"),
      authorId: v.optional(v.id("users")),
      content: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);
    return messages;
  },
});

/**
 * Send a message to a channel and schedule a response from the AI.
 */
export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    authorId: v.id("users"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    const user = await ctx.db.get(args.authorId);
    if (!user) {
      throw new Error("User not found");
    }
    await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: args.authorId,
      content: args.content,
    });
    await ctx.scheduler.runAfter(0, internal.index.generateResponse, {
      channelId: args.channelId,
    });
    return null;
  },
});

const openai = new OpenAI();

export const generateResponse = internalAction({
  args: {
    channelId: v.id("channels"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(internal.index.loadContext, {
      channelId: args.channelId,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: context,
    });
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }
    await ctx.runMutation(internal.index.writeAgentResponse, {
      channelId: args.channelId,
      content,
    });
    return null;
  },
});

export const loadContext = internalQuery({
  args: {
    channelId: v.id("channels"),
  },
  returns: v.array(
    v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);

    const result = [];
    for (const message of messages) {
      if (message.authorId) {
        const user = await ctx.db.get(message.authorId);
        if (!user) {
          throw new Error("User not found");
        }
        result.push({
          role: "user" as const,
          content: `${user.name}: ${message.content}`,
        });
      } else {
        result.push({ role: "assistant" as const, content: message.content });
      }
    }
    return result;
  },
});

export const writeAgentResponse = internalMutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      channelId: args.channelId,
      content: args.content,
    });
    return null;
  },
});
```

#### convex/schema.ts
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  channels: defineTable({
    name: v.string(),
  }),

  users: defineTable({
    name: v.string(),
  }),

  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
  }).index("by_channel", ["channelId"]),
});
```

#### src/App.tsx
```typescript
export default function App() {
  return <div>Hello World</div>;
}
```

Best Practices
This is a list of best practices and common anti-patterns around using Convex. We recommend going through this list before broadly releasing your app to production. You may choose to try using all of these best practices from the start, or you may wait until you've gotten major parts of your app working before going through and adopting the best practices here.

Await all Promises
Why?
Convex functions use async / await. If you don't await all your promises (e.g. await ctx.scheduler.runAfter, await ctx.db.patch), you may run into unexpected behavior (e.g. failing to schedule a function) or miss handling errors.

How?
We recommend the no-floating-promises eslint rule with TypeScript.

Avoid .filter on database queries
Why?
Filtering in code instead of using the .filter syntax has the same performance, and is generally easier code to write. Conditions in .withIndex or .withSearchIndex are more efficient than .filter or filtering in code, so almost all uses of .filter should either be replaced with a .withIndex or .withSearchIndex condition, or written as TypeScript code.

Read through the indexes documentation for an overview of how to define indexes and how they work.

Examples
convex/messages.ts
TS
// ❌
const tomsMessages = ctx.db
  .query("messages")
  .filter((q) => q.eq(q.field("author"), "Tom"))
  .collect();

// ✅
// Option 1: Use an index
const tomsMessages = await ctx.db
  .query("messages")
  .withIndex("by_author", (q) => q.eq("author", "Tom"))
  .collect();

// Option 2: Filter in code
const allMessages = await ctx.db.query("messages").collect();
const tomsMessages = allMessages.filter((m) => m.author === "Tom");

How?
Search for .filter in your Convex codebase — a regex like \.filter\(\(?q will probably find all the ones on database queries.

Decide whether they should be replaced with a .withIndex condition — per this section, if you are filtering over a large (1000+) or potentially unbounded number of documents, you should use an index. If not using a .withIndex / .withSearchIndex condition, consider replacing them with a filter in code for more readability and flexibility.

See this article for more strategies for filtering.

Exceptions
Using .filter on a paginated query (.paginate) has advantages over filtering in code. The paginated query will return the number of documents requested, including the .filter condition, so filtering in code afterwards can result in a smaller page or even an empty page. Using .withIndex on a paginated query will still be more efficient than a .filter.

Only use .collect with a small number of results
Why?
All results returned from .collect count towards database bandwidth (even ones filtered out by .filter). It also means that if any document in the result changes, the query will re-run or the mutation will hit a conflict.

If there's a chance the number of results is large (say 1000+ documents), you should use an index to filter the results further before calling .collect, or find some other way to avoid loading all the documents such as using pagination, denormalizing data, or changing the product feature.

Example
Using an index:

convex/movies.ts
TS
// ❌ -- potentially unbounded
const allMovies = await ctx.db.query("movies").collect();
const moviesByDirector = allMovies.filter(
  (m) => m.director === "Steven Spielberg",
);

// ✅ -- small number of results, so `collect` is fine
const moviesByDirector = await ctx.db
  .query("movies")
  .withIndex("by_director", (q) => q.eq("director", "Steven Spielberg"))
  .collect();

Using pagination:

convex/movies.ts
TS
// ❌ -- potentially unbounded
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", "Tom"))
  .collect();

// ✅ -- using pagination, showing recently watched movies first
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", "Tom"))
  .order("desc")
  .paginate(paginationOptions);

Using a limit or denormalizing:

convex/movies.ts
TS
// ❌ -- potentially unbounded
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", "Tom"))
  .collect();
const numberOfWatchedMovies = watchedMovies.length;

// ✅ -- Show "99+" instead of needing to load all documents
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", "Tom"))
  .take(100);
const numberOfWatchedMovies =
  watchedMovies.length === 100 ? "99+" : watchedMovies.length.toString();

// ✅ -- Denormalize the number of watched movies in a separate table
const watchedMoviesCount = await ctx.db
  .query("watchedMoviesCount")
  .withIndex("by_user", (q) => q.eq("user", "Tom"))
  .unique();

How?
Search for .collect in your Convex codebase (a regex like \.collect\( will probably find these). And think through whether the number of results is small. This function health page in the dashboard can also help surface these.

The aggregate component or database triggers can be helpful patterns for denormalizing data.

Exceptions
If you're doing something that requires loading a large number of documents (e.g. performing a migration, making a summary), you may want to use an action to load them in batches via separate queries / mutations.

Check for redundant indexes
Why?
Indexes like by_foo and by_foo_and_bar are usually redundant (you only need by_foo_and_bar). Reducing the number of indexes saves on database storage and reduces the overhead of writing to the table.

convex/teams.ts
TS
// ❌
const allTeamMembers = await ctx.db
  .query("teamMembers")
  .withIndex("by_team", (q) => q.eq("team", teamId))
  .collect();
const currentUserId = /* get current user id from `ctx.auth` */
const currentTeamMember = await ctx.db
  .query("teamMembers")
  .withIndex("by_team_and_user", (q) =>
    q.eq("team", teamId).eq("user", currentUserId),
  )
  .unique();

// ✅
// Just don't include a condition on `user` when querying for results on `team`
const allTeamMembers = await ctx.db
  .query("teamMembers")
  .withIndex("by_team_and_user", (q) => q.eq("team", teamId))
  .collect();
const currentUserId = /* get current user id from `ctx.auth` */
const currentTeamMember = await ctx.db
  .query("teamMembers")
  .withIndex("by_team_and_user", (q) =>
    q.eq("team", teamId).eq("user", currentUserId),
  )
  .unique();

How?
Look through your indexes, either in your schema.ts file or in the dashboard, and look for any indexes where one is a prefix of another.

Exceptions
.index("by_foo", ["foo"]) is really an index on the properties foo and _creationTime, while .index("by_foo_and_bar", ["foo", "bar"]) is an index on the properties foo, bar, and _creationTime. If you have queries that need to be sorted by foo and then _creationTime, then you need both indexes.

For example, .index("by_channel", ["channel"]) on a table of messages can be used to query for the most recent messages in a channel, but .index("by_channel_and_author", ["channel", "author"]) could not be used for this since it would first sort the messages by author.

Use argument validators for all public functions
Why?
Public functions can be called by anyone, including potentially malicious attackers trying to break your app. Argument validators (as well as return value validators) help ensure you're getting the traffic you expect.

Example
convex/messages.ts
TS
// ❌ -- could be used to update any document (not just `messages`)
export const updateMessage = mutation({
  handler: async (ctx, { id, update }) => {
    await ctx.db.patch(id, update);
  },
});

// ✅ -- can only be called with an ID from the messages table, and can only update
// the `body` and `author` fields
export const updateMessage = mutation({
  args: {
    id: v.id("messages"),
    update: v.object({
      body: v.optional(v.string()),
      author: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, update }) => {
    await ctx.db.patch(id, update);
  },
});

How?
Search for query, mutation, and action in your Convex codebase, and ensure that all of them have argument validators (and optionally return value validators). If you have httpActions, you may want to use something like zod to validate that the HTTP request is the shape you expect.

Use some form of access control for all public functions
Why?
Public functions can be called by anyone, including potentially malicious attackers trying to break your app. If portions of your app should only be accessible when the user is signed in, make sure all these Convex functions check that ctx.auth.getUserIdentity() is set.

You may also have specific checks, like only loading messages that were sent to or from the current user, which you'll want to apply in every relevant public function.

Favoring more granular functions like setTeamOwner over updateTeam allows more granular checks for which users can do what.

Access control checks should either use ctx.auth.getUserIdentity() or a function argument that is unguessable (e.g. a UUID, or a Convex ID, provided that this ID is never exposed to any client but the one user). In particular, don't use a function argument which could be spoofed (e.g. email) for access control checks.

Example
convex/teams.ts
TS
// ❌ -- no checks! anyone can update any team if they get the ID
export const updateTeam = mutation({
  args: {
    id: v.id("teams"),
    update: v.object({
      name: v.optional(v.string()),
      owner: v.optional(v.id("users")),
    }),
  },
  handler: async (ctx, { id, update }) => {
    await ctx.db.patch(id, update);
  },
});

// ❌ -- checks access, but uses `email` which could be spoofed
export const updateTeam = mutation({
  args: {
    id: v.id("teams"),
    update: v.object({
      name: v.optional(v.string()),
      owner: v.optional(v.id("users")),
    }),
    email: v.string(),
  },
  handler: async (ctx, { id, update, email }) => {
    const teamMembers = /* load team members */
    if (!teamMembers.some((m) => m.email === email)) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(id, update);
  },
});

// ✅ -- checks access, and uses `ctx.auth`, which cannot be spoofed
export const updateTeam = mutation({
  args: {
    id: v.id("teams"),
    update: v.object({
      name: v.optional(v.string()),
      owner: v.optional(v.id("users")),
    }),
  },
  handler: async (ctx, { id, update }) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }
    const isTeamMember = /* check if user is a member of the team */
    if (!isTeamMember) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(id, update);
  },
});

// ✅ -- separate functions which have different access control
export const setTeamOwner = mutation({
  args: {
    id: v.id("teams"),
    owner: v.id("users"),
  },
  handler: async (ctx, { id, owner }) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }
    const isTeamOwner = /* check if user is the owner of the team */
    if (!isTeamOwner) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(id, { owner: owner });
  },
});

export const setTeamName = mutation({
  args: {
    id: v.id("teams"),
    name: v.string(),
  },
  handler: async (ctx, { id, name }) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }
    const isTeamMember = /* check if user is a member of the team */
    if (!isTeamMember) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(id, { name: name });
  },
});

How?
Search for query, mutation, action, and httpAction in your Convex codebase, and ensure that all of them have some form of access control. Custom functions like authenticatedQuery can be helpful.

Some apps use Row Level Security (RLS) to check access to each document automatically whenever it's loaded, as described in this article. Alternatively, you can check access in each Convex function instead of checking access for each document.

Helper functions for common checks and common operations can also be useful -- e.g. isTeamMember, isTeamAdmin, loadTeam (which throws if the current user does not have access to the team).

Only schedule and ctx.run* internal functions
Why?
Public functions can be called by anyone, including potentially malicious attackers trying to break your app, and should be carefully audited to ensure they can't be used maliciously. Functions that are only called within Convex can be marked as internal, and relax these checks since Convex will ensure that internal functions can only be called within Convex.

How?
Search for ctx.runQuery, ctx.runMutation, and ctx.runAction in your Convex codebase. Also search for ctx.scheduler and check the crons.ts file. Ensure all of these use internal.foo.bar functions instead of api.foo.bar functions.

If you have code you want to share between a public Convex function and an internal Convex function, create a helper function that can be called from both. The public function will likely have additional access control checks.

Alternatively, make sure that api from _generated/api.ts is never used in your Convex functions directory.

Examples
convex/teams.ts
TS
// ❌ -- using `api`
export const sendMessage = mutation({
  args: {
    body: v.string(),
    author: v.string(),
  },
  handler: async (ctx, { body, author }) => {
    // add message to the database
  },
});

// crons.ts
crons.daily(
  "send daily reminder",
  { hourUTC: 17, minuteUTC: 30 },
  api.messages.sendMessage,
  { author: "System", body: "Share your daily update!" },
);

// ✅ Using `internal`
import { MutationCtx } from './_generated/server';
async function sendMessageHelper(
  ctx: MutationCtx,
  args: { body: string; author: string },
) {
  // add message to the database
}

export const sendMessage = mutation({
  args: {
    body: v.string(),
  },
  handler: async (ctx, { body }) => {
    const user = await ctx.auth.getUserIdentity();
    if (user === null) {
      throw new Error("Unauthorized");
    }
    await sendMessageHelper(ctx, { body, author: user.name ?? "Anonymous" });
  },
});

export const sendInternalMessage = internalMutation({
  args: {
    body: v.string(),
    // don't need to worry about `author` being spoofed since this is an internal function
    author: v.string(),
  },
  handler: async (ctx, { body, author }) => {
    await sendMessageHelper(ctx, { body, author });
  },
});

// crons.ts
crons.daily(
  "send daily reminder",
  { hourUTC: 17, minuteUTC: 30 },
  internal.messages.sendInternalMessage,
  { author: "System", body: "Share your daily update!" },
);

Use helper functions to write shared code
Why?
Most logic should be written as plain TypeScript functions, with the query, mutation, and action wrapper functions being a thin wrapper around one or more helper function.

Concretely, most of your code should live in a directory like convex/model, and your public API, which is defined with query, mutation, and action, should have very short functions that mostly just call into convex/model.

Organizing your code this way makes several of the refactors mentioned in this list easier to do.

See the TypeScript page for useful types.

Example
❌ This example overuses ctx.runQuery and ctx.runMutation, which is discussed more in the Avoid sequential ctx.runMutation / ctx.runQuery from actions section.

convex/users.ts
TS
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (userIdentity === null) {
      throw new Error("Unauthorized");
    }
    const user = /* query ctx.db to load the user */
    const userSettings = /* load other documents related to the user */
    return { user, settings: userSettings };
  },
});

convex/conversations.ts
TS
export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    const conversation = await ctx.db.get(conversationId);
    if (conversation === null || !conversation.members.includes(user._id)) {
      throw new Error("Unauthorized");
    }
    const messages = /* query ctx.db to load the messages */
    return messages;
  },
});

export const summarizeConversation = action({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const messages = await ctx.runQuery(api.conversations.listMessages, {
      conversationId,
    });
    const summary = /* call some external service to summarize the conversation */
    await ctx.runMutation(api.conversations.addSummary, {
      conversationId,
      summary,
    });
  },
});

✅ Most of the code here is now in the convex/model directory. The API for this application is in convex/conversations.ts, which contains very little code itself.

convex/model/users.ts
TS
import { QueryCtx } from '../_generated/server';

export async function getCurrentUser(ctx: QueryCtx) {
  const userIdentity = await ctx.auth.getUserIdentity();
  if (userIdentity === null) {
    throw new Error("Unauthorized");
  }
  const user = /* query ctx.db to load the user */
  const userSettings = /* load other documents related to the user */
  return { user, settings: userSettings };
}

convex/model/conversations.ts
TS
import { QueryCtx, MutationCtx } from '../_generated/server';
import * as Users from './users';

export async function ensureHasAccess(
  ctx: QueryCtx,
  { conversationId }: { conversationId: Id<"conversations"> },
) {
  const user = await Users.getCurrentUser(ctx);
  const conversation = await ctx.db.get(conversationId);
  if (conversation === null || !conversation.members.includes(user._id)) {
    throw new Error("Unauthorized");
  }
  return conversation;
}

export async function listMessages(
  ctx: QueryCtx,
  { conversationId }: { conversationId: Id<"conversations"> },
) {
  await ensureHasAccess(ctx, { conversationId });
  const messages = /* query ctx.db to load the messages */
  return messages;
}

export async function addSummary(
  ctx: MutationCtx,
  {
    conversationId,
    summary,
  }: { conversationId: Id<"conversations">; summary: string },
) {
  await ensureHasAccess(ctx, { conversationId });
  await ctx.db.patch(conversationId, { summary });
}

export async function generateSummary(
  messages: Doc<"messages">[],
  conversationId: Id<"conversations">,
) {
  const summary = /* call some external service to summarize the conversation */
  return summary;
}

convex/conversations.ts
TS
import * as Conversations from './model/conversations';

export const addSummary = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    summary: v.string(),
  },
  handler: async (ctx, { conversationId, summary }) => {
    await Conversations.addSummary(ctx, { conversationId, summary });
  },
});

export const listMessages = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    return Conversations.listMessages(ctx, { conversationId });
  },
});

export const summarizeConversation = action({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const messages = await ctx.runQuery(internal.conversations.listMessages, {
      conversationId,
    });
    const summary = await Conversations.generateSummary(
      messages,
      conversationId,
    );
    await ctx.runMutation(internal.conversations.addSummary, {
      conversationId,
      summary,
    });
  },
});

Use runAction only when using a different runtime
Why?
Calling runAction has more overhead than calling a plain TypeScript function. It counts as an extra function call with its own memory and CPU usage, while the parent action is doing nothing except waiting for the result. Therefore, runAction should almost always be replaced with calling a plain TypeScript function. However, if you want to call code that requires Node.js from a function in the Convex runtime (e.g. using a library that requires Node.js), then you can use runAction to call the Node.js code.

Example
convex/scrape.ts
TS
// ❌ -- using `runAction`
export const scrapeWebsite = action({
  args: {
    siteMapUrl: v.string(),
  },
  handler: async (ctx, { siteMapUrl }) => {
    const siteMap = await fetch(siteMapUrl);
    const pages = /* parse the site map */
    await Promise.all(
      pages.map((page) =>
        ctx.runAction(internal.scrape.scrapeSinglePage, { url: page }),
      ),
    );
  },
});

convex/model/scrape.ts
TS
import { ActionCtx } from '../_generated/server';

// ✅ -- using a plain TypeScript function
export async function scrapeSinglePage(
  ctx: ActionCtx,
  { url }: { url: string },
) {
  const page = await fetch(url);
  const text = /* parse the page */
  await ctx.runMutation(internal.scrape.addPage, { url, text });
}

convex/scrape.ts
TS
import * as Scrape from './model/scrape';

export const scrapeWebsite = action({
  args: {
    siteMapUrl: v.string(),
  },
  handler: async (ctx, { siteMapUrl }) => {
    const siteMap = await fetch(siteMapUrl);
    const pages = /* parse the site map */
    await Promise.all(
      pages.map((page) => Scrape.scrapeSinglePage(ctx, { url: page })),
    );
  },
});

How?
Search for runAction in your Convex codebase, and see if the function it calls uses the same runtime as the parent function. If so, replace the runAction with a plain TypeScript function. You may want to structure your functions so the Node.js functions are in a separate directory so it's easier to spot these.

Avoid sequential ctx.runMutation / ctx.runQuery calls from actions
Why?
Each ctx.runMutation or ctx.runQuery runs in its own transaction, which means if they're called separately, they may not be consistent with each other. If instead we call a single ctx.runQuery or ctx.runMutation, we're guaranteed that the results we get are consistent.

How?
Audit your calls to ctx.runQuery and ctx.runMutation in actions. If you see multiple in a row with no other code between them, replace them with a single ctx.runQuery or ctx.runMutation that handles both things. Refactoring your code to use helper functions will make this easier.

Example: Queries
convex/teams.ts
TS
// ❌ -- this assertion could fail if the team changed between running the two queries
const team = await ctx.runQuery(internal.teams.getTeam, { teamId });
const teamOwner = await ctx.runQuery(internal.teams.getTeamOwner, { teamId });
assert(team.owner === teamOwner._id);

convex/teams.ts
TS
import * as Teams from './model/teams';
import * as Users from './model/users';

export const sendBillingReminder = action({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, { teamId }) => {
    // ✅ -- this will always pass
    const teamAndOwner = await ctx.runQuery(internal.teams.getTeamAndOwner, {
      teamId,
    });
    assert(teamAndOwner.team.owner === teamAndOwner.owner._id);
    // send a billing reminder email to the owner
  },
});

export const getTeamAndOwner = internalQuery({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, { teamId }) => {
    const team = await Teams.load(ctx, { teamId });
    const owner = await Users.load(ctx, { userId: team.owner });
    return { team, owner };
  },
});

Example: Loops
convex/teams.ts
TS
import * as Users from './model/users';

export const importTeams = action({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, { teamId }) => {
    // Fetch team members from an external API
    const teamMembers = await fetchTeamMemberData(teamId);

    // ❌ This will run a separate mutation for inserting each user,
    // which means you lose transaction guarantees like atomicity.
    for (const member of teamMembers) {
      await ctx.runMutation(internal.teams.insertUser, member);
    }
  },
});
export const insertUser = internalMutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, { name, email }) => {
    await Users.insert(ctx, { name, email });
  },
});

convex/teams.ts
TS
import * as Users from './model/users';

export const importTeams = action({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, { teamId }) => {
    // Fetch team members from an external API
    const teamMembers = await fetchTeamMemberData(teamId);

    // ✅ This action runs a single mutation that inserts all users in the same transaction.
    await ctx.runMutation(internal.teams.insertUsers, teamMembers);
  },
});
export const insertUsers = internalMutation({
  args: { users: v.array(v.object({ name: v.string(), email: v.string() })) },
  handler: async (ctx, { users }) => {
    for (const { name, email } of users) {
      await Users.insert(ctx, { name, email });
    }
  },
});

Exceptions
If you're intentionally trying to process more data than fits in a single transaction, like running a migration or aggregating data, then it makes sense to have multiple sequential ctx.runMutation / ctx.runQuery calls.

Multiple ctx.runQuery / ctx.runMutation calls are often necessary because the action does a side effect in between them. For example, reading some data, feeding it to an external service, and then writing the result back to the database.

Use ctx.runQuery and ctx.runMutation sparingly in queries and mutations
Why?
While these queries and mutations run in the same transaction, and will give consistent results, they have extra overhead compared to plain TypeScript functions. Wanting a TypeScript helper function is much more common than needing ctx.runQuery or ctx.runMutation.

How?
Audit your calls to ctx.runQuery and ctx.runMutation in queries and mutations. Unless one of the exceptions below applies, replace them with a plain TypeScript function.

Exceptions
If you're using components, these require ctx.runQuery or ctx.runMutation.
If you want partial rollback on an error, you will want ctx.runMutation instead of a plain TypeScript function.
convex/messages.ts
TS
export const trySendMessage = mutation({
  args: {
    body: v.string(),
    author: v.string(),
  },
  handler: async (ctx, { body, author }) => {
    try {
      await ctx.runMutation(internal.messages.sendMessage, { body, author });
    } catch (e) {
      // Record the failure, but rollback any writes from `sendMessage`
      await ctx.db.insert("failures", {
        kind: "MessageFailed",
        body,
        author,
        error: `Error: ${e}`,
      });
    }
  },
});

TypeScript
Convex provides end-to-end type support when Convex functions are written in TypeScript.

You can gradually add TypeScript to a Convex project: the following steps provide progressively better type support. For the best support you'll want to complete them all.

Example: TypeScript and Schema

Writing Convex functions in TypeScript
The first step to improving type support in a Convex project is to writing your Convex functions in TypeScript by using the .ts extension.

If you are using argument validation, Convex will infer the types of your functions arguments automatically:

convex/sendMessage.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    body: v.string(),
    author: v.string(),
  },
  // Convex knows that the argument type is `{body: string, author: string}`.
  handler: async (ctx, args) => {
    const { body, author } = args;
    await ctx.db.insert("messages", { body, author });
  },
});

Otherwise you can annotate the arguments type manually:

convex/sendMessage.ts
import { internalMutation } from "./_generated/server";

export default internalMutation({
  // To convert this function from JavaScript to
  // TypeScript you annotate the type of the arguments object.
  handler: async (ctx, args: { body: string; author: string }) => {
    const { body, author } = args;
    await ctx.db.insert("messages", { body, author });
  },
});

This can be useful for internal functions accepting complicated types.

If TypeScript is installed in your project npx convex dev and npx convex deploy will typecheck Convex functions before sending code to the Convex backend.

Convex functions are typechecked with the tsconfig.json in the Convex folder: you can modify some parts of this file to change typechecking settings, or delete this file to disable this typecheck.

You'll find most database methods have a return type of Promise<any> until you add a schema.

Adding a schema
Once you define a schema the type signature of database methods will be known. You'll also be able to use types imported from convex/_generated/dataModel in both Convex functions and clients written in TypeScript (React, React Native, Node.js etc.).

The types of documents in tables can be described using the Doc type from the generated data model and references to documents can be described with parametrized Document IDs.

convex/messages.ts
import { query } from "./_generated/server";

export const list = query({
  args: {},
  // The inferred return type of `handler` is now `Promise<Doc<"messages">[]>`
  handler: (ctx) => {
    return ctx.db.query("messages").collect();
  },
});

Type annotating server-side helpers
When you want to reuse logic across Convex functions you'll want to define helper TypeScript functions, and these might need some of the provided context, to access the database, authentication and any other Convex feature.

Convex generates types corresponding to documents and IDs in your database, Doc and Id, as well as QueryCtx, MutationCtx and ActionCtx types based on your schema and declared Convex functions:

convex/helpers.ts
// Types based on your schema
import { Doc, Id } from "./_generated/dataModel";
// Types based on your schema and declared functions
import {
  QueryCtx,
  MutationCtx,
  ActionCtx,
  DatabaseReader,
  DatabaseWriter,
} from "./_generated/server";
// Types that don't depend on schema or function
import {
  Auth,
  StorageReader,
  StorageWriter,
  StorageActionWriter,
} from "convex/server";

// Note that a `MutationCtx` also satisfies the `QueryCtx` interface
export function myReadHelper(ctx: QueryCtx, id: Id<"channels">) {
  /* ... */
}

export function myActionHelper(ctx: ActionCtx, doc: Doc<"messages">) {
  /* ... */
}

Inferring types from validators
Validators can be reused between argument validation and schema validation. You can use the provided Infer type to get a TypeScript type corresponding to a validator:

convex/helpers.ts
import { Infer, v } from "convex/values";

export const courseValidator = v.union(
  v.literal("appetizer"),
  v.literal("main"),
  v.literal("dessert"),
);

// The corresponding type can be used in server or client-side helpers:
export type Course = Infer<typeof courseValidator>;
// is inferred as `'appetizer' | 'main' | 'dessert'`

Document types without system fields
All documents in Convex include the built-in _id and _creationTime fields, and so does the generated Doc type. When creating or updating a document you might want use the type without the system fields. Convex provides WithoutSystemFields for this purpose:

convex/helpers.ts
import { MutationCtx } from "./_generated/server";
import { WithoutSystemFields } from "convex/server";
import { Doc } from "./_generated/dataModel";

export async function insertMessageHelper(
  ctx: MutationCtx,
  values: WithoutSystemFields<Doc<"messages">>,
) {
  // ...
  await ctx.db.insert("messages", values);
  // ...
}

Writing frontend code in TypeScript
All Convex JavaScript clients, including React hooks like useQuery and useMutation provide end to end type safety by ensuring that arguments and return values match the corresponding Convex functions declarations. For React, install and configure TypeScript so you can write your React components in .tsx files instead of .jsx files.

Follow our React or Next.js quickstart to get started with Convex and TypeScript.

Type annotating client-side code
When you want to pass the result of calling a function around your client codebase, you can use the generated types Doc and Id, just like on the backend:

src/App.tsx
import { Doc, Id } from "../convex/_generated/dataModel";

function Channel(props: { channelId: Id<"channels"> }) {
  // ...
}

function MessagesView(props: { message: Doc<"messages"> }) {
  // ...
}

You can also declare custom types inside your backend codebase which include Docs and Ids, and import them in your client-side code.

You can also use WithoutSystemFields and any types inferred from validators via Infer.

Using inferred function return types
Sometimes you might want to annotate a type on the client based on whatever your backend function returns. Beside manually declaring the type (on the backend or on the frontend), you can use the generic FunctionReturnType and UsePaginatedQueryReturnType types with a function reference:

src/Components.tsx
import { FunctionReturnType } from "convex/server";
import { UsePaginatedQueryReturnType } from "convex/react";
import { api } from "../convex/_generated/api";

export function MyHelperComponent(props: {
  data: FunctionReturnType<typeof api.myFunctions.getSomething>;
}) {
  // ...
}

export function MyPaginationHelperComponent(props: {
  paginatedData: UsePaginatedQueryReturnType<
    typeof api.myFunctions.getSomethingPaginated
  >;
}) {
  // ...
}

Document IDs
Example: Relational Data Modeling

Every document in convex has a globally unique string document ID that is automatically generated by the system.

const userId = await ctx.db.insert("users", { name: "Michael Jordan" });

You can use this ID to efficiently read a single document using the get method:

const retrievedUser = await ctx.db.get(userId);

You can access the ID of a document in the _id field:

const userId = retrievedUser._id;

Also, this same ID can be used to update that document in place:

await ctx.db.patch(userId, { name: "Steph Curry" });

Convex generates an Id TypeScript type based on your schema that is parameterized over your table names:

import { Id } from "./_generated/dataModel";

const userId: Id<"users"> = user._id;

IDs are strings at runtime, but the Id type can be used to distinguish IDs from other strings at compile time.

References and relationships
In Convex, you can reference a document simply by embedding its Id in another document:

await ctx.db.insert("books", {
  title,
  ownerId: user._id,
});

You can follow references with ctx.db.get:

const user = await ctx.db.get(book.ownerId);

And query for documents with a reference:

const myBooks = await ctx.db
  .query("books")
  .filter((q) => q.eq(q.field("ownerId"), user._id))
  .collect();

Using Ids as references can allow you to build a complex data model.

Trading off deeply nested documents vs. relationships
While it's useful that Convex supports nested objects and arrays, you should keep documents relatively small in size. In practice, we recommend limiting Arrays to no more than 5-10 elements and avoiding deeply nested Objects.

Instead, leverage separate tables, documents, and references to structure your data. This will lead to better maintainability and performance as your project grows.

Serializing IDs
IDs are strings, which can be easily inserted into URLs or stored outside of Convex.

You can pass an ID string from an external source (like a URL) into a Convex function and get the corresponding object. If you're using TypeScript on the client you can cast a string to the Id type:

src/App.tsx
import { useQuery } from "convex/react";
import { Id } from "../convex/_generated/dataModel";
import { api } from "../convex/_generated/api";

export function App() {
  const id = localStorage.getItem("myIDStorage");
  const task = useQuery(api.tasks.getTask, { taskId: id as Id<"tasks"> });
  // ...
}

Since this ID is coming from an external source, use an argument validator or ctx.db.normalizeId to confirm that the ID belongs to the expected table before returning the object.

convex/tasks.ts
TS
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    // ...
  },
});

System Tables
System tables enable read-only access to metadata for built-in Convex features. Currently there are two system tables exposed:

"_scheduled_functions" table contains metadata for scheduled functions
"_storage" table contains metadata for stored files
You can read data from system tables using the db.system.get and db.system.query methods, which work the same as the standard db.get and db.query methods. Queries reading from system tables are reactive and realtime just like queries reading from all other tables, and pagination can be used to enumerate all documents even when there are too many to read in a single query.