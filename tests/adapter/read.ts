import { expect } from "chai";
import nock from "nock";

import ImageKitAdapter from "../../src";
import ImageKitAdapterError from "../../src/utils/errors";
import { testConfig } from "../fixtures";

const imagekitAdapter = new ImageKitAdapter(testConfig());

describe("read", function () {
  it("Should read the image", async function () {
    nock("https://ik.imagekit.io")
      .get("/test/default-image.jpg")
      .reply(200, "imagebuffer");

    const options = {
      path: "https://ik.imagekit.io/test/default-image.jpg",
    };

    const buffer = await imagekitAdapter.read(options);

    nock.restore();

    expect(buffer.toString()).to.equal("imagebuffer");
  });

  it("Should return an error for the missing options parameter", async function () {
    try {
      await imagekitAdapter.read();
    } catch (err) {
      expect(err).to.be.an.instanceOf(ImageKitAdapterError);
      expect(err.statusCode).to.be.equal(400);
      expect(err.message).to.be.equal(
        "Failed to read image from path 'undefined'"
      );
    }
  });

  it("Should return an error for a non-existent file", async function () {
    nock("https://ik.imagekit.io").get("/test/default-image.jpg").reply(404);

    const options = {
      path: "https://ik.imagekit.io/test/default-image.jpg",
    };

    try {
      await imagekitAdapter.read(options);
    } catch (err) {
      expect(err).to.be.an.instanceOf(ImageKitAdapterError);
      expect(err.statusCode).to.be.equal(404);
      expect(err.message).to.be.equal(
        "Failed to read image from path 'https://ik.imagekit.io/test/default-image.jpg'"
      );
    }

    nock.restore();
  });

  it("Should return an error if restrict unsigned image URLs setting is enabled in dashboard", async function () {
    nock("https://ik.imagekit.io").get("/test/default-image.jpg").reply(401);

    const options = {
      path: "https://ik.imagekit.io/test/default-image.jpg",
    };

    try {
      await imagekitAdapter.read(options);
    } catch (err) {
      expect(err).to.be.an.instanceOf(ImageKitAdapterError);
      expect(err.statusCode).to.be.equal(401);
      expect(err.message).to.be.equal(
        "Failed to read image from path 'https://ik.imagekit.io/test/default-image.jpg'"
      );
    }

    nock.restore();
  });

  it("Should return an error if image is a private file", async function () {
    nock("https://ik.imagekit.io").get("/test/default-image.jpg").reply(403);

    const options = {
      path: "https://ik.imagekit.io/test/default-image.jpg",
    };

    try {
      await imagekitAdapter.read(options);
    } catch (err) {
      expect(err).to.be.an.instanceOf(ImageKitAdapterError);
      expect(err.statusCode).to.be.equal(403);
      expect(err.message).to.be.equal(
        "Failed to read image from path 'https://ik.imagekit.io/test/default-image.jpg'"
      );
    }

    nock.restore();
  });
});
