import { expect } from "chai";
import Imagekit from "imagekit";
import moment from "moment";
import * as sinon from "sinon";
import { image, testConfig, uploadResponse } from "../fixtures";

import { readFileAsync } from "../../src/utils";

import ImageKitAdapter from "../../src";

describe("save", function () {
  let uploadStub: sinon.SinonStub;
  let file: Buffer;

  before(async function () {
    file = await readFileAsync(image.path);
  });

  beforeEach(function () {
    uploadStub = sinon
      .stub(Imagekit.prototype, "upload")
      .resolves(uploadResponse);
  });

  afterEach(function () {
    uploadStub.restore();
  });

  it("Should upload successfully with config parameters and tagetDir", async function () {
    const imagekitAdapter = new ImageKitAdapter(testConfig());
    const response = await imagekitAdapter.save(image, "/ghost/blog/");

    expect(
      response.includes("https://ik.imagekit.io/test/default-image")
    ).to.equal(true);

    expect(
      uploadStub.calledOnceWith({
        file,
        fileName: "default-image.jpeg",
        useUniqueFileName: true,
        folder: "/ghost/blog/",
        tags: [],
      })
    ).to.equal(true);
  });

  it("Should upload successfully with configured parameters and dated folders disabled", async function () {
    const config = testConfig();
    config.enableDatedFolders = false;
    const imagekitAdapter = new ImageKitAdapter(config);
    const response = await imagekitAdapter.save(image);

    expect(
      response.includes("https://ik.imagekit.io/test/default-image")
    ).to.equal(true);

    expect(
      uploadStub.calledOnceWith({
        file,
        fileName: "default-image.jpeg",
        useUniqueFileName: true,
        folder: "/",
        tags: [],
      })
    ).to.equal(true);
  });

  it("Should upload successfully with configured parameters and dated folders enabled", async function () {
    const imagekitAdapter = new ImageKitAdapter(testConfig());
    const response = await imagekitAdapter.save(image);

    expect(
      response.includes("https://ik.imagekit.io/test/default-image")
    ).to.equal(true);

    const date = moment(),
      year = date.format("YYYY"),
      month = date.format("MM");

    expect(
      uploadStub.calledOnceWith({
        file,
        fileName: "default-image.jpeg",
        useUniqueFileName: true,
        folder: `/${year}/${month}`,
        tags: [],
      })
    ).to.equal(true);
  });
});
