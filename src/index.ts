import Arweave from "arweave";
import { AxiosRequestConfig } from "axios";

interface HostConfig {
  host: string;
  port: number;
  protocol: string;
};

interface AdditionalArweaveConfig {
  timeout: number;
  logging: boolean;
  logger?: (...arg: any) => any;
  onError?: (...arg: any) => any;
};

const DEFAULT_HOSTS = [
  {
    host: "arweave.net",
    protocol: "https",
    port: 443,
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
];

const defaultArweaveConfig: AdditionalArweaveConfig = {
  timeout: 10000,
  logging: false,
  onError: console.error,
};

/**
   * Returns overrriden arweave instance
   * @param hosts - Array of hosts
   * @param config - Other configuration options
   * (timeout, logging, logger, onError callback)
   * @returns arweave instance
   */
function init(
  hosts: HostConfig[],
  config: AdditionalArweaveConfig = defaultArweaveConfig): Arweave {
    if (hosts.length === 0) {
      throw new Error("Multihost config should have at least one host");
    }

    const arweave = Arweave.init({
      ...hosts[0],
      ...config,
    });

    let currentHostIndex = 0, lastFailedHost = 0;

    function updateHostParams(hostConfig: HostConfig) {
      arweave.api.config.host = hostConfig.host;
      arweave.api.config.port = hostConfig.port;
      arweave.api.config.protocol = hostConfig.protocol;
    }

    const originalApiRequestMethods = {
      get: arweave.api.get.bind(arweave.api),
      post: arweave.api.post.bind(arweave.api),
    };

    function switchHost() {
      const oldHost = getCurrentHost();
      currentHostIndex = (currentHostIndex + 1) % hosts.length;
      const newHost = hosts[currentHostIndex];
      if (config.logging && config.logger !== undefined) {
        config.logger(
          "Request failed. Switching host and retrying. "
          + `Old host: ${JSON.stringify(oldHost)}. `
          + `New host: ${JSON.stringify(newHost)}.`)
      }
      updateHostParams(newHost);
    }

    function getCurrentHost() {
      return hosts[currentHostIndex];
    }

    function isHostActive(host: HostConfig) {
      const currentHost = getCurrentHost();
      return JSON.stringify(host) === JSON.stringify(currentHost);
    }

    async function overridenRequestMethod(sendOriginalRequest: any) {
      for (let i = 0; i < hosts.length; i++) {
        const hostUsedForRequest = getCurrentHost();
        try {
          const response = await sendOriginalRequest();
          return response;
        } catch (err) {
          // config.onError callback may be used for error logging
          if (config.onError) {
            config.onError(err);
          }

          if (i === hosts.length - 1) {
            throw err;
          } else {
            // We switch host only if it's still active.
            // If it's not active it means that it was switched by
            // another concurrent request
            if (isHostActive(hostUsedForRequest)) {
              switchHost();
            }
          }
        }
      }
      throw new Error("Should never reach this");
    }

    arweave.api.get = async (
      endpoint: string,
      axiosConfig?: AxiosRequestConfig) => {
        return await overridenRequestMethod(
          () => originalApiRequestMethods.get(endpoint, axiosConfig));
      }

    arweave.api.post = async (
      endpoint: string,
      body: Buffer | string | object,
      axiosConfig?: AxiosRequestConfig) => {
        return await overridenRequestMethod(
          () => originalApiRequestMethods.post(endpoint, body, axiosConfig));
      }

  return arweave;
}

/**
   * Returns overrriden arweave instance with default hosts
   * (arweave.net, gateway.amplify.host, arweave.dev)
   * @param config - Other configuration options
   * (timeout, logging, logger, onError callback)
   * @returns arweave instance
   */
function initWithDefaultHosts(config: AdditionalArweaveConfig): Arweave {
  return init(DEFAULT_HOSTS, config);
}

export = {
  init,
  initWithDefaultHosts,
};
