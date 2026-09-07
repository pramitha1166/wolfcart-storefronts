declare module "directpay-ipg-js" {
  export class Init {
    constructor(options: {
      signature: string;
      dataString: string;
      stage: "DEV" | "PROD";
      container?: string;
    });
    doInAppCheckout(): Promise<any>;
    doInContainerCheckout(): Promise<any>;
  }

  export const config: any;
  export const pluginVersion: string;
}
