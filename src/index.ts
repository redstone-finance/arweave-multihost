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
  logger?: (...arg: any) => void;
};

const defaultArweaveConfig: AdditionalArweaveConfig = {
  timeout: 10000,
  logging: false,
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

    async function hanldeError<ReturnType>(
      e: Error, retry: () => Promise<ReturnType>): Promise<ReturnType> {
        errorCounter++;
        if (errorCounter > hosts.length) {
          throw e;
        } else {
          switchHost();

          // Request retrying
          return await retry();
        }
      }

    // TODO: refactor
    // There is a coe duplication in methods below
    // We can remove it to make the code more readable

    arweave.api.get = async (
      endpoint: string,
      axiosConfig?: AxiosRequestConfig) => {
        try {
          const result = await originalApiRequestMethods.get(
            endpoint,
            axiosConfig);
          errorCounter = 0;
          return result;
        } catch (e) {
          return hanldeError(e, () => arweave.api.get(endpoint, axiosConfig));
        }
      }

    arweave.api.post = async (
      endpoint: string,
      body: Buffer | string | object,
      axiosConfig?: AxiosRequestConfig) => {
        try {
          const result = await originalApiRequestMethods.post(
            endpoint,
            body,
            axiosConfig);
          errorCounter = 0;
          return result;
        } catch (e) {
          return hanldeError(
            e,
            () => arweave.api.post(endpoint, body, axiosConfig));
          // errorCounter++;
          // if (errorCounter > hosts.length) {
          //   throw e;
          // } else {
          //   switchHost();

          //   // Request retrying
          //   return await arweave.api.post(endpoint, body, axiosConfig);
          // }
        }
      }

    

  return arweave;
}

export = { init };
