const mainEvent = { emit: jest.fn() };
beforeEach(() => mainEvent.emit.mockReset());
const fs = require("fs-extra");
jest.mock("fs-extra", () => ({
  renameSync: jest.fn(),
  ensureDir: jest.fn()
}));
const log = require("../../../lib/log.js");
jest.mock("../../../lib/log.js");
const api = require("./api.js");
jest.mock("./api.js");
const path = require("path");

const cachePath = "surprise.xz/inthename";

const pmosPlugin = new (require("./plugin.js"))(
  {
    settings: {
      release: "somerelease",
      interface: "someinterface"
    },
    config: {
      codename: "somecodename"
    }
  },
  cachePath,
  mainEvent,
  log
);

describe("postmarketos plugin", () => {
  describe("action__download()", () => {
    it("should download images", async () => {
      const files = [{ url: "http://somewebsite.com/somefilename.zip" }];
      api.getImages.mockResolvedValueOnce(files);

      const ret = await pmosPlugin.action__download();
      expect(api.getImages).toHaveBeenCalledWith(
        "somerelease",
        "someinterface",
        "somecodename"
      );
      expect(ret[0]).toBeDefined();
      expect(ret[0].actions).toContainEqual({
        "core:download": {
          group: "postmarketOS",
          files
        }
      });
      expect(ret[0].actions).toContainEqual({
        "postmarketos:rename_unpacked_files": {
          group: "postmarketOS",
          files
        }
      });
      expect(ret[0].actions[1]["core:unpack"].files).toContainEqual({
        url: files[0].url,
        archive: "somefilename.zip",
        dir: "."
      });
    });
  });

  describe("action__rename_unpacked_files()", () => {
    it("should rename the files", async () => {
      jest.spyOn(pmosPlugin.event, "emit").mockReturnValue();

      const group = "group";
      const basepath = path.join(cachePath, "somecodename", group);
      const files = [
        {
          name: "boot.img.xz"
        },
        {
          url: "https://asdf.io/somethingelse.img.xz"
        }
      ];

      await pmosPlugin.action__rename_unpacked_files({ group, files });
      expect(pmosPlugin.event.emit).toHaveBeenCalledTimes(3);
      expect(fs.renameSync).toHaveBeenCalledWith(
        path.join(basepath, "boot.img"),
        path.join(basepath, "boot.img")
      );
      expect(fs.renameSync).toHaveBeenCalledWith(
        path.join(basepath, "somethingelse.img"),
        path.join(basepath, "rootfs.img")
      );
    });
  });

  describe("remote_values__interfaces()", () => {
    it("should get interfaces", async () => {
      await pmosPlugin.remote_values__interfaces();

      expect(api.getInterfaces).toHaveBeenCalledWith("somecodename");
    });
  });

  describe("remote_values__releases()", () => {
    it("should get releases", async () => {
      api.getReleases.mockResolvedValueOnce(["a", "b"]);
      const result = await pmosPlugin.remote_values__releases();
      expect(api.getReleases).toHaveBeenCalledWith("somecodename");
      expect(result).toContainEqual({
        label: "a",
        value: "a"
      });
      expect(result).toContainEqual({
        label: "b",
        value: "b"
      });
    });
  });
});
