import { describe, expect, it } from "vitest";
import { InMemoryObjectStorage } from "../../src/ports/objectStorage";

describe("InMemoryObjectStorage", () => {
  it("returns a deterministic url after uploading", async () => {
    const storage = new InMemoryObjectStorage();
    const blob = new Blob(["photo bytes"], { type: "image/png" });

    const { url } = await storage.upload("floorplans/1.png", blob);

    expect(url).toBe("memory://floorplans/1.png");
    expect(storage.getUrl("floorplans/1.png")).toBe(url);
  });

  it("returns undefined for a key that was never uploaded", () => {
    const storage = new InMemoryObjectStorage();
    expect(storage.getUrl("missing.png")).toBeUndefined();
  });

  it("retrieves the original blob via getFile", async () => {
    const storage = new InMemoryObjectStorage();
    const blob = new Blob(["photo bytes"], { type: "image/png" });

    await storage.upload("cells/0-0.png", blob);

    expect(storage.getFile("cells/0-0.png")).toBe(blob);
  });

  it("overwrites the blob and url when uploading the same key twice", async () => {
    const storage = new InMemoryObjectStorage();
    await storage.upload("a.png", new Blob(["v1"]));
    const second = new Blob(["v2"]);
    await storage.upload("a.png", second);

    expect(storage.getFile("a.png")).toBe(second);
  });
});
