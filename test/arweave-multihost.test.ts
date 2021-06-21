import ArweaveMultihost from "../src";
import axios from "axios";

describe("Testing arweave multihost client", () => {
  test("Should initialize arweave multihost and get network info", async () => {
    // Given
    const arweave = ArweaveMultihost.init([
      {
        host: "bad-host-1",
        protocol: "https",
        port: 443,
      },
      {
        host: "bad-host-2",
        protocol: "https",
        port: 443,
      },
      {
        host: "arweave.net",
        protocol: "https",
        port: 443,
      },
      {
        host: "arweave.dev",
        protocol: "https",
        port: 443,
      },
    ], {
      timeout: 3000,
      logging: true,
      logger: console.log,
      onError: console.error,
    });
    const spy = jest.spyOn(arweave.api, "request");
    
    // When
    const info = await arweave.network.getInfo();

    // Then
    console.log(info);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(info).toBeDefined();
    expect(info).toHaveProperty("network", "arweave.N.1");
  });
});
