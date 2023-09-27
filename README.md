# ImageKit Ghost Storage

[ImageKit's](https://imagekit.io) [Ghost](https://github.com/TryGhost/Ghost) storage adapter.

### Features

- Up to date with the most recent Ghost release.
- Uses the latest ImageKit [NodeJS SDK](https://github.com/imagekit-developer/imagekit-nodejs/releases).
- Supports image read, existence check, and upload.
- Serve existing images present in Ghost's default storage.
- Ability to upload images into a specific directory.
- Ability to configure uploads in dated subdirectories like the default Ghost local storage adapter in `YYYY/MM` format.
- Use ImageKit's [upload API](https://docs.imagekit.io/api-reference/upload-file-api/server-side-file-upload) to set `tags`, `useUniqueFileName`, and `folder`.

## Installation

### Using yarn

- Go into your Ghost project's root directory.
- Install the adapter:

```bash
yarn add bugfixdev-ghost-imagekit-store
cp node_modules/bugfixdev-ghost-imagekit-store/dist/src content/adapters/storage/imagekit/
```

- Configure Ghost's config file.

### Install on Docker

Here's an example of using this adapter with a containerized Ghost:

```Dockerfile
FROM ghost:5-alpine as imagekit
RUN apk add g++ make python3
RUN su-exec node yarn add bugfixdev-ghost-imagekit-store

FROM ghost:5-alpine
COPY --chown=node:node --from=imagekit $GHOST_INSTALL/node_modules $GHOST_INSTALL/node_modules
COPY --chown=node:node --from=imagekit $GHOST_INSTALL/node_modules/bugfixdev-ghost-imagekit-store/dist/src/index.js $GHOST_INSTALL/content/adapters/storage/imagekit/index.js
# Here, we use the Ghost CLI to set some pre-defined values.
RUN set -ex; \
    su-exec node ghost config storage.active imagekit; \
    su-exec node ghost config storage.imagekit.uploadOptions.useUniqueFileName true; \
    su-exec node ghost config storage.imagekit.uploadOptions.folder /ghost/blog;
```

Make sure the content path is correctly set in the Ghost configuration:

```json
"paths": {
    "contentPath": "/var/lib/ghost/content/"
}
```

## Configuration

Check out [configuration.json.dist](./configuration.json.dist) or below for a complete example.

```json
{
    "storage": {
        "active": "imagekit",
        "imagekit": {
            "enableDatedFolders": true,
            "auth": {
                "privateKey": "your-private-key",
                "publicKey": "your-public-key",
                "urlEndpoint": "https://ik.imagekit.io/your-imagekit-id"
            },
            "uploadOptions": {
                "useUniqueFileName": true,
                "folder": "/sample",
                "tags": ["blog"]
            }
        }
    },
    "imageOptimization": {
        "resize": false
    }
}
```

- Make sure [Ghost Image Optimization](https://ghost.org/docs/config/#image-optimisation) is disabled.
- The optional `enableDatedFolders` setting allows uploading images into dated sub-directories (like the default Ghost Local Storage Adapter). It is `true` by default.
- The `auth` property is used to configure your ImageKit account's credentials and URL endpoint. You can find them in the [dashboard](https://imagekit.io/dashboard/developer/api-keys).
- The `uploadOptions` property allows you to configure ImageKit's upload options. You can configure `useUniqueFileName`, `folder`, and `tags`.

### Recommended configuration

- `uploadOptions.useUniqueFileName = true` Ghost's local storage adaptor handles duplicate file names automatically. When uploading a file to a location where a file with the same name already exists, ImageKit creates a new file version. In order to avoid this, `useUniqueFileName` can be set to `true`.
- `uploadOptions.tags = ["travel", "discover"]` if you want to add associations of tags to your uploaded images.
- `uploadOptions.folder = "/ghost/blog"` allows to upload all your images into a specific directory in your ImageKit media library. By default, files are uploaded to the root of media library.

## ImageKit dashboard settings

Ensure that `Restrict unsigned image URLs` settings is turned off in your [ImageKit account](https://imagekit.io/dashboard/settings/images). This is because the storage adapter currently does not support fetching images that require [signed URLs](https://docs.imagekit.io/features/security/signed-urls), including private files.

## Development

To install, run:

```bash
yarn install
```

To run tests and generate coverage, run:

```bash
yarn test
```

To build, run:

```bash
yarn build
```
