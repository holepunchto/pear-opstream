# Opstream

> Pear operations stream base class

Readable stream wrapper around an async `op(params)` function.

Emits status object data events, at minimum:

- zero or one `{ tag: 'error', ... }` objects - logical errors from `op`, not stream errors
- exactly one `{ tag: 'final', ... }` object

For convenience consumer counterpart library see [pear-opwait](https://github.com/holepunchto/pear-opwait).

## Install

```
npm install pear-opstream
```

## API: `new Opstream(op, params, done?)`

Create a new `Opstream` Instance.

### Parameters

- `op: (params) => Promise<any>`
  Async function called once when the stream eagerly reads.

- `params: Object`
  Input passed into `op`.
  - if `params.linka is present, it is normalized at origin:
    ```js
    params.link = plink.normalize(params.link)
    ```

- `done?: () => void`
  Optional callback once emitted after the final chunk and stream ends.

## Emitted data status objects

- if `op` rejects.

  ```js
  {
    tag: 'error',
    data: { stack, code, message, success: false, info }
  }
  ```

- `final` status object always emitted exactly once:

  ```js
  {
    tag: 'final',
    data: { success, ...final }
  }
  ```

## Custom final

The `{ tag: 'final', ... }` status object merges with `instance.final`.

Set `this.final` in subclass to declare final return value of opstream.

```js
this.final = { result: 42 }
```

final chunk:

```js
{
  tag: 'final',
  data: { success: true, result: 42 }
}
```

## License

Apache-2.0
