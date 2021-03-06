import ArweaveMultihost from "../src";

// Mocking axios
const requestedUrls: string[] = [];
jest.mock("axios", () => {
  return {
    create: jest.fn((config) => ({
      get: jest.fn().mockImplementation(async (path) => {
        const url = `${config.baseURL}/${path}`;
        requestedUrls.push(url);

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
      timeout: 3000,
      logging: true,
      logger: console.log,
      onError: console.log,
    });
    
    // When
    await arweave.network.getInfo();

    // Then
    expect(requestedUrls).toEqual([
      "https://bad-host-1:443/info",
      "https://bad-host-2:443/info",
      "https://good-host-1:443/info",
    ]);
  });
});
