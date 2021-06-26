# Arweave Multihost JS SDK

JavaScript/TypeScript Arweave SDK with multiple host support. It is a wrapper for the official [Arweave JS SDK](https://github.com/ArweaveTeam/arweave-js), which allows to configure multiple hosts.

By default it uses the first host from the host list, but if it fails to execute any request (like sending a transaction or getting the network info) it will automatically switch the host to the next one from the list and make it the new default. If all the hosts fail to execute the request, error will be thrown.

## 🚀 Demo
Try it directly in CodeSandbox: [demo link](https://codesandbox.io/s/arweave-multihost-demo-8r68b?file=/src/index.ts)

## 📦 Installation

### Using npm
```bash
npm install arweave-multihost
```

### Using yarn
```bash
yarn add arweave-multihost
```

## 💡 Usage

### 1. Importing
```js
// Using Node.js `require()`
const ArweaveMultihost = require("arweave-multihost");

// Using ES6 imports
import ArweaveMultihost from "arweave-multihost";
```

### 2. Initialisation

#### Init with custom hosts

```js
const arweave = ArweaveMultihost.init(
  // Hosts
  [
    {
      host: "arweave.net", // Hostname or IP address for a Arweave host
      protocol: "https",   // Port
      port: 443,           // Network protocol http or https
    },
    {
      host: "gateway.amplify.host",
      protocol: "https",
      port: 443,
    },
    {
      host: "arweave.dev",
      protocol: "https",
      port: 443,
    },
  ], {
    timeout: 10000,         // Network request timeouts in milliseconds
    logging: true,          // Enable network request logging
    logger: console.log,    // Logger function
    onError: console.error, // On request error callback
  });
```

#### Init with the default hosts
You can also use `arweave.initWithDefaultHosts(config)` method to initialise Arweave instance with the default hosts array (aweave.net, gateway.amplify.host, arweave.dev)
```js

const arweave = ArweaveMultihost.initWithDefaultHosts({
  timeout: 10000,         // Network request timeouts in milliseconds
  logging: true,          // Enable network request logging
  logger: console.log,    // Logger function
  onError: console.error, // On request error callback
});
```

### 3. Usage
Then you can use the arweave instance in the same way as you would use it with the standard Arweave JS SDK. [See more examples](https://github.com/ArweaveTeam/arweave-js#usage) from the official Arweave JS SDK.

## 🤖 Examples
- [Codesandbox demo](https://codesandbox.io/s/arweave-multihost-demo-8r68b?file=/src/index.ts)
- [Node js scripts](examples/)

## 📜 License
This software is licensed under the [MIT](https://choosealicense.com/licenses/mit/) © [Redstone](https://github.com/redstone-finance)
