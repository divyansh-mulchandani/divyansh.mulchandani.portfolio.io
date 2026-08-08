declare module "swagger-ui-react" {
  import React from "react";

  interface SwaggerUIProps {
    url?: string;
    spec?: object;
    docExpansion?: "list" | "full" | "none";
    defaultModelsExpandDepth?: number;
    tryItOutEnabled?: boolean;
    requestInterceptor?: (req: Record<string, unknown>) => Record<string, unknown>;
  }

  const SwaggerUI: React.FC<SwaggerUIProps>;
  export default SwaggerUI;
}
