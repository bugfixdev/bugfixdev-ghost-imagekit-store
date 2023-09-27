import merge from "lodash.merge";
import { InternalServerError as GhostInternalError } from "@tryghost/errors";

class ImageKitAdapterError extends GhostInternalError {
  // @ts-ignore
  constructor(options) {
    super(
      merge(
        {
          errorType: "ImageStorageAdapterError",
          message:
            "An error has occurred while handling the image storage adapter.",
          level: "error",
        },
        options
      )
    );
  }
}

export default ImageKitAdapterError;
