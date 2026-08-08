"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function DocsPage() {
  const [specUrl, setSpecUrl] = useState<string>("");

  useEffect(() => {
    setSpecUrl(`${window.location.origin}/api/docs`);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <div
        style={{
          background: "#0a0e1a",
          padding: "20px 32px",
          borderBottom: "1px solid rgba(99,179,237,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <a
          href="/"
          style={{
            color: "#63b3ed",
            fontSize: 13,
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          ← Portfolio
        </a>
        <span style={{ color: "#2d3a5a" }}>|</span>
        <span style={{ color: "#a0aec0", fontSize: 14, fontWeight: 600 }}>
          API Documentation
        </span>
      </div>
      {specUrl && (
        <SwaggerUI
          url={specUrl}
          docExpansion="list"
          defaultModelsExpandDepth={1}
          tryItOutEnabled={true}
          requestInterceptor={(req: Record<string, unknown>) => {
            req.credentials = "include";
            return req;
          }}
        />
      )}
    </div>
  );
}
