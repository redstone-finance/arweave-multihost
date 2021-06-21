import ArweaveMultihost from "../src";

describe("Testing arweave multihost client", () => {
  test("Should initialize arweave multihost and get network info", async () => {
    const arweave = ArweaveMultihost.init([
      {
        host: "129.0.0.1",
        protocol: "http",
        port: 80,
      },
      {
        host: "129.0.0.2",
        protocol: "http",
        port: 80,
      },
      {
        host: "arweave.net",
        protocol: "https",
        port: 443,
      },
    ], {
      timeout: 3000,
      logging: true,
      logger: console.log,
    });
    
    // TODO: improve this test
    const info = await arweave.network.getInfo();
    console.log(info);
  });
});
