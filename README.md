# TSCircuit Debug API

> Also see [debug frontend](https://github.com/tscircuit/debug.tscircuit.com-frontend)

This API is used to debug circuits and layouts and is hosted on [debug.tscircuit.com](https://debug.tscircuit.com)

> Note: TSCircuit build output JSON is also called "soup" because it's a large
> set of elements without a structure. The debug API takes soups and attempts
> to display them with a variety of filters and a variety of renderers.

## Usage

There is authenticated mode authorization and un-authenticated mode authorization.

### Unauthenticated Mode

This is for short lived debugging circuits, the links do not last and generally
have no access rules.

| Endpoint                                   | Description                                              |
| ------------------------------------------ | -------------------------------------------------------- |
| `GET /api/soup_group/get?soup_group_name=` | List all the circuit soups in a soup group               |
| `GET /api/soup_group/list`                 | List all the soup groups                                 |
| `POST /api/soup_group/add_soup`            | Submit a circuit soup to enable it to be displayed a URL |

### Adding a Circuit Soup

There are 4 parameters to add a circuit soup:

- soup_name: Typically "schematic" or "pcb", this is kind of like a filename
- soup_group_name: Typically the "repo name" or the name of the project. When unauthenticated this is a random 16 character string.
- content: The JSON content of the circuit soup `{ elements }`
- username: Username to store the soup under, if unauthenticated defaults to `tmp`.

### Authenticated Mode TODO

TODO

## Running Tests

To run tests, you need to have postgres database running locally and passwordless
in the background. This can be done with this command:

```bash
docker run -d --rm -p 5432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16
```

I recommend aliasing this on your system to `pgbg` to make it easier to run,
it's a common testing requirement in tscircuit server projects.

Read more about [the testing pattern here](https://seve.blog/p/a-simple-pattern-for-api-testing)

## Misc Details

- Soups are part of a Soup Group. A Soup will have a name and generally only
  one soup is rendered at a time. Two soups may not share the same name.
- Generally the url to access a soup group is `debug.tscircuit.com/USERNAME/SOUP_GROUP_NAME`
