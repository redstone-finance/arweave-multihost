import ArweaveMultihost from "../src";

// Mocking axios
let requestedUrls: string[] = [];
let badResponseStatusCode = 500;
jest.mock("axios", () => {
  return {
    create: jest.fn((config) => ({
      get: jest.fn().mockImplementation(async (path) => {
        const url = `${config.baseURL}/${path}`;
        requestedUrls.push(url);

        if (config.baseURL.includes("bad")) {
          return { status: badResponseStatusCode, data: "Mock error" };
        } else {
          return { status: 200 };
        }
      }),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    }))
  }
});

describe("Testing arweave multihost client hmm", () => {
  beforeEach(() => {
    requestedUrls = [];
  });

  test("Should switch host because of status: 500", async () => {
    // Given
    const arweave = ArweaveMultihost.init([
      {
        host: "bad-host",
        protocol: "https",
        port: 443,
      },
      {
        host: "good-host",
        protocol: "https",
        port: 443,
      },
    ], {
      timeout: 10000,
      logging: true,
      logger: console.log,
      onError: (...args: any[]) => console.log("Arweave request error: ", ...args),
    });
    
    // When
    await arweave.network.getInfo();

    // Then
    expect(requestedUrls).toEqual([
      'https://bad-host:443/info',
      'https://good-host:443/info',
    ]);
  });

  test("Should switch host because of status: 504", async () => {
    // Given
    badResponseStatusCode = 504;
    const arweave = ArweaveMultihost.init([
      {
        host: "bad-host",
        protocol: "https",
        port: 443,
      },
      {
        host: "good-host",
        protocol: "https",
        port: 443,
      },
    ], {
      timeout: 10000,
      logging: true,
      logger: console.log,
      onError: (...args: any[]) => console.log("Arweave request error: ", ...args),
    });
    
    // When
    await arweave.network.getInfo();

    // Then
    expect(requestedUrls).toEqual([
      'https://bad-host:443/info',
      'https://good-host:443/info',
    ]);
  });

  test("Should not switch host because of status: 403", async () => {
    // Given
    badResponseStatusCode = 403;
    const arweave = ArweaveMultihost.init([
      {
        host: "bad-host",
        protocol: "https",
        port: 443,
      },
      {
        host: "good-host",
        protocol: "https",
        port: 443,
      },
    ], {
      timeout: 10000,
      logging: true,
      logger: console.log,
      onError: (...args: any[]) => console.log("Arweave request error: ", ...args),
    });
    
    // When
    await arweave.network.getInfo();

    // Then
    expect(requestedUrls).toEqual([
      'https://bad-host:443/info',
    ]);
  });
});
