import initArweave from "../src/index";

main();

async function main(): Promise<void> {
  console.log("Test started");
  const arweave = initArweave([
    {
      host: "127.0.0.1",
      protocol: "http",
      port: 80,
    },
    // {
    //   host: "127.0.0.2",
    //   protocol: "http",
    //   port: 80,
    // },
    {
      host: "127.0.0.3",
      protocol: "https",
      port: 443,
    },
    {
      host: "arweave.dev",
      protocol: "https",
      port: 443,
    },
    {
      host: "arweave.net",
      protocol: "https",
      port: 443,
    },
    
  ]);
  const info = await arweave.network.getInfo();
  console.log({ info });
  // console.log(JSON.stringify(info));
}
