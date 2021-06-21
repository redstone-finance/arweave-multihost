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

const defaultArweaveConfig: AdditionalArweaveConfig = {
  timeout: 10000,
  logging: false,
  onError: console.error,
};

function init(
  hosts: HostConfig[],
  config: AdditionalArweaveConfig = defaultArweaveConfig) {
    if (hosts.length === 0) {
      throw new Error("Multihost config should have at least one host");
    }

    const arweave = Arweave.init({
      ...hosts[0],
      ...config,
    });

    let currentHostIndex = 0, errorCounter = 0;

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
      const oldHost = hosts[currentHostIndex];
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

    async function overridenRequestMethod(sendOriginalRequest: any) {
      for (let i = 0; i < hosts.length; i++) {
        try {
          const response = await sendOriginalRequest();
          return response;
        } catch (err) {
          if (i === hosts.length - 1) {
            throw err;
          } else {
            switchHost();
            if (config.onError) {
              config.onError(err);
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

export = { init };
