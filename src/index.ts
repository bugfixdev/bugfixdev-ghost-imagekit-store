import StorageBase from "ghost-storage-base";
import got from "got";
import ImageKit from "imagekit";
import { join } from "path";
import serveStatic from "serve-static";

import { readFileAsync, stripLeadingSlash } from "../utils";
import ImageKitAdapterError from "../utils/errors";

const fileServe = serveStatic(
  join(process.env.GHOST_CONTENT as string, "images"),
  {
    fallthrough: true,
    maxAge: "1y",
  }
);

export interface ImageKitStoreConfig {
  auth: {
    urlEndpoint: string;
    privateKey: string;
    publicKey: string;
  };
  uploadOptions: {
    useUniqueFileName?: boolean;
    tags?: string[];
    folder?: string;
  };
  enableDatedFolders: boolean;
}

class Store extends StorageBase {
  private urlEndpoint: string;
  private privateKey: string;
  private publicKey: string;
  private enableDatedFolders: boolean;
  private uploadOptions: ImageKitStoreConfig["uploadOptions"];
  private _imagekit: ImageKit;

  constructor(config: ImageKitStoreConfig) {
    super();

    const { auth, uploadOptions = {}, enableDatedFolders = true } = config;

    const {
      urlEndpoint = process.env.IMAGEKIT_STORE_URL_ENDPOINT,
      privateKey = process.env.IMAGEKIT_STORE_PRIVATE_KEY,
      publicKey = process.env.IMAGEKIT_STORE_PUBLIC_KEY,
    } = auth || {};

    const { useUniqueFileName = true, tags = [], folder = "/" } = uploadOptions;

    this.enableDatedFolders =
      enableDatedFolders.toString() === "false" || enableDatedFolders === false
        ? false
        : true;
    this.urlEndpoint = urlEndpoint ?? "";
    this.privateKey = privateKey ?? "";
    this.publicKey = publicKey ?? "";
    this.uploadOptions = {
      useUniqueFileName:
        useUniqueFileName.toString() === "false" || useUniqueFileName === false
          ? false
          : true,
      tags,
      folder: folder,
    };

    this._imagekit = new ImageKit({
      urlEndpoint: this.urlEndpoint,
      publicKey: this.publicKey,
      privateKey: this.privateKey,
    });
  }

  async exists(fileName: string, targetDir?: string): Promise<boolean> {
    console.log("exists", fileName, targetDir);
    try {
      const filePath = stripLeadingSlash(join(targetDir || "", fileName));
      const response = await got(new URL(filePath, this.urlEndpoint), {
        responseType: "buffer",
        resolveBodyOnly: true,
      });
      if (response) return true;
    } catch (err) {
      return false;
    }
    return false;
  }

  async save(image: StorageBase.Image, targetDir?: string): Promise<string> {
    console.log("save", image.name);
    try {
      const folder =
        targetDir ??
        (this.enableDatedFolders
          ? this.getTargetDir(this.uploadOptions.folder)
          : this.uploadOptions.folder);

      const fileName = this.getSanitizedFileName(image.name);

      const file = await readFileAsync(image.path);

      const uploadResponse = await this._imagekit.upload({
        file,
        fileName,
        useUniqueFileName: this.uploadOptions.useUniqueFileName,
        folder,
        tags: this.uploadOptions.tags,
      });

      const result = new URL(uploadResponse.url);
      result.searchParams.append("updatedAt", new Date().getTime().toString());
      return result.toString();
    } catch (err) {
      throw new ImageKitAdapterError({
        statusCode: err.$ResponseMetadata.statusCode,
        message: err.message ?? "Failed to save image",
      });
    }
  }

  serve() {
    return (req: any, res: any, next: any) => {
      console.log("serve", req.url);
      fileServe(req, res, () => {
        console.log("file not found");
        res.status(404).end();
      });
    };
  }

  async delete(fileName: string, targetDir?: string): Promise<boolean> {
    console.log("delete", fileName, targetDir);
    throw new ImageKitAdapterError({
      statusCode: 400,
      message:
        "Currently, deleting a file by path is not possible via the API.",
    });
  }

  async read(options?: StorageBase.ReadOptions): Promise<Buffer> {
    console.log("read", options);
    try {
      return await got(new URL(options?.path || "", this.urlEndpoint), {
        responseType: "buffer",
        resolveBodyOnly: true,
      });
    } catch (err) {
      throw new ImageKitAdapterError({
        statusCode: err.response.statusCode,
        message: `Failed to read image from path '${options?.path}'`,
      });
    }
  }
}

export default Store;
