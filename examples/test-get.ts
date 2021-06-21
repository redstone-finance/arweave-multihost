import ArweaveMultihost from "../src/index";

main();

async function main(): Promise<void> {
  console.log("Test started");
  const arweave = ArweaveMultihost.init([
    {
      host: "127.0.0.1",
      protocol: "http",
      port: 80,
    },
    {
      host: "127.0.0.3",
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
    timeout: 10000,
    logging: true,
    logger: console.log,
  });
  const info = await arweave.network.getInfo();
  console.log({ info });
}
