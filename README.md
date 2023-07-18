> **Datading**  
> "ding"; Dutch for "thing", thusly "data thing"

## TLDR

_Datading_ is a library to help with loading data in React apps.

## Installation

```bash
npm install datading
```

## Usage

_Datading_ centers around `RestfulRepository`. To start using _datading_, you should initialize one;

```typescript
import { RestfulRepository } from "datading";

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

const repository = new RestfulRepository<
  Record<`posts/${number}`, Post> & Record<`users/${number}`, User>
>("https://jsonplaceholder.typicode.com");
```

As you might've deduced from the example, there are two things to keep in mind when initializing a `RestfulRepository`;

- The type parameter reflects the API and it's return values. It should be an object type whose keys are the (relative) URLs and whose values are the data types returned by the endpoints.
- The parameter that's passed into the constructor is the APIs base URL.

### Imperative (`load`)

To use the repository imperatively, call the `load` method;

```typescript
function getPost(id: number): Promise<Post> {
  return repository.load(`posts/1`);
}
```

For most simple applications, the built-in `use` hook will suffice, but imperative calls can be useful to allow for data loading in more niche scenarios whilst still providing the performance benefits (such as caching and collective loading) which _datading_ provides.

### Hooks / Declarative (`use`)

To use data in a component, call the `use` method;

```typescript
function PostDisplay({ postId }: { postId: number }) {
  const { value: post, loading, error } = repository.use(`posts/${postId}`);

  return (
    <li>
      {(() => {
        if (loading) {
          return "Loading";
        } else if (error || post === undefined) {
          return "An error occurred";
        } else {
          return (
            <>
              <h1>{post.title}</h1>
              <p>{post.body}</p>
            </>
          );
        }
      })()}
    </li>
  );
}
```
