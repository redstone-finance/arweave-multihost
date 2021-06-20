import initArweave from "../src/index";
import jwk from "../.secrets/jwk.json";

main();

async function main(): Promise<void> {
  console.log("Post test started");

  const hosts = [
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
    // {
    //   host: "127.0.0.3",
    //   protocol: "https",
    //   port: 443,
    // },
    // {
    //   host: "arweave.dev",
    //   protocol: "https",
    //   port: 443,
    // },
    {
      host: "arweave.net",
      protocol: "https",
      port: 443,
    },
  ];

  const arweave = initArweave(hosts);
  const arweave2 = initArweave(hosts);

  console.log("--------------------------------------------------------------------");
  console.log("Creating and signing a test transaction");
  console.log("--------------------------------------------------------------------");
  const transaction = await arweave.createTransaction({ data: "test" }, jwk);
  transaction.addTag("application", "arweave-multihost-test");
  await arweave.transactions.sign(transaction, jwk);
  console.log(`Tx id: ${transaction.id}`);

  console.log("--------------------------------------------------------------------");
  console.log("Posting the test transaction");
  console.log("--------------------------------------------------------------------");
  // We use arweave2 to test host switching for POST methods as well
  const response = await arweave2.transactions.post(transaction);
  console.log({ transactionPostRresponse: response });
}
