"use client";

import { Button, ConfigProvider, Result, theme } from "antd";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";

export default function NotFound() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorPrimary: "#63b3ed", colorBgBase: "#0a0e1a" },
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0e1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="404"
          title={<span style={{ color: "#f7fafc" }}>404</span>}
          subTitle={
            <span style={{ color: "#a0aec0" }}>
              This page doesn&apos;t exist. Let&apos;s get you back on track.
            </span>
          }
          extra={[
            <Button
              key="home"
              type="primary"
              icon={<HomeOutlined />}
              href="/"
              style={{ borderRadius: 8 }}
            >
              Back to Portfolio
            </Button>,
            <Button
              key="contact"
              icon={<UserOutlined />}
              href="/#contact"
              style={{ borderRadius: 8 }}
            >
              Contact Me
            </Button>,
          ]}
        />
      </div>
    </ConfigProvider>
  );
}
