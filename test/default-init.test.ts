import ArweaveMultihost from "../src";

describe("Testing arweave multihost client", () => {
  test("Should initialize default arweave multihost and get network info", async () => {
    // Given
    const arweave = ArweaveMultihost.initWithDefaultHosts({
      timeout: 3000,
      logging: true,
      logger: console.log,
      onError: console.log,
    });
    const spy = jest.spyOn(arweave.api, "get");
    
    // When
    const info = await arweave.network.getInfo();

    // Then
    expect(spy).toBeCalledWith("info");
    expect(spy).toBeCalledTimes(1);
    expect(info).toHaveProperty("network", "arweave.N.1");
  });
});
