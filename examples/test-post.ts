// IMPORTANT: to run this example you should place JWK key file in the .secrets folder

import ArweaveMultihost from "../src";
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
    {
      host: "arweave.net",
      protocol: "https",
      port: 443,
    },
  ];

  const config = {
    timeout: 10000,
    logging: true,
    logger: console.log,
  };

  const arweave = ArweaveMultihost.init(hosts, config);
  const arweave2 = ArweaveMultihost.init(hosts, config);

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
