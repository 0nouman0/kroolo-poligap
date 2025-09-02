import { Portkey } from "portkey-ai";

class PortkeyClient {
  client: Portkey;
  constructor() {
    this.client = new Portkey({
      apiKey: process.env.PORTKEY_API_KEY,
    });
  }
}

export default PortkeyClient;
