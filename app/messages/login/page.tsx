"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Form,
  Input,
  Alert,
  ConfigProvider,
  theme,
  Typography,
} from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import styles from "../style.module.css";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinish(values: { username: string; password: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (res.ok) {
        router.push("/messages");
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Login failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorPrimary: "#63b3ed", colorBgBase: "#0a0e1a" },
      }}
    >
      <div className={styles.loginWrapper}>
        <Card className={styles.loginCard} bordered={false}>
          <Title level={3} className={styles.loginTitle}>
            Admin Login
          </Title>
          <Text className={styles.loginSubtitle}>
            Sign in to view contact messages.
          </Text>

          {error && (
            <Alert
              type="error"
              message={error}
              className={styles.loginError}
              showIcon
            />
          )}

          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              name="username"
              label={<Text style={{ color: "#a0aec0" }}>Username</Text>}
              rules={[{ required: true, message: "Username is required" }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#4a5568" }} />}
                placeholder="Username"
                autoComplete="username"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text style={{ color: "#a0aec0" }}>Password</Text>}
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#4a5568" }} />}
                placeholder="Password"
                autoComplete="current-password"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ borderRadius: 8, marginTop: 8 }}
            >
              Sign In
            </Button>
          </Form>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <a href="/" style={{ color: "#63b3ed", fontSize: 13 }}>
              ← Back to Portfolio
            </a>
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
}
