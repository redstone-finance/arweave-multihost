import ArweaveMultihost from "../src";


function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mocking axios
const requestedUrls: string[] = [];
jest.mock("axios", () => {
  return {
    create: jest.fn((config) => ({
      get: jest.fn().mockImplementation(async (path) => {
        const url = `${config.baseURL}/${path}`;
        requestedUrls.push(url);

        if (path === "info") {
          await sleep(1000);
        }

        if (config.baseURL.includes("bad")) {
          throw new Error("Bad url");
        } else {
          return {};
        }
      }),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    }))
  }
});

describe("Testing concurrent request sending", () => {
  test("Should correctly execute concurrent requests", async () => {
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
        host: "good-host-1",
        protocol: "https",
        port: 443,
      },
      {
        host: "good-host-2",
        protocol: "https",
        port: 443,
      },
    ], {
      timeout: 10000,
      logging: true,
      logger: console.log,
    });
    
    // When
    const infoPromise = arweave.network.getInfo();
    const peersPromise = arweave.network.getPeers();
    await Promise.all([infoPromise, peersPromise]);

    // Then
    expect(requestedUrls).toEqual([
      "https://bad-host-1:443/info",
      "https://bad-host-1:443/peers",
      "https://bad-host-2:443/peers",
      "https://good-host-1:443/peers",
      "https://good-host-1:443/info",
    ]);
  });
});
