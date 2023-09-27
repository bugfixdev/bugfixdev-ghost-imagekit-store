import { expect } from "chai";

import ImageKitAdapter from "../../src";
import ImageKitAdapterError from "../../src/utils/errors";
import { mockImage, testConfig } from "../fixtures";

const imagekitAdapter = new ImageKitAdapter(testConfig());

describe("delete", function () {
  it("Should return error as delete by path is not supported by API", async function () {
    try {
      await imagekitAdapter.delete(mockImage.name, mockImage.targetDir);
    } catch (err) {
      expect(err).to.be.an.instanceOf(ImageKitAdapterError);
      expect(err.statusCode).to.be.equal(400);
      expect(err.message).to.be.equal(
        "Currently, deleting a file by path is not possible via the API."
      );
    }
  });
});
