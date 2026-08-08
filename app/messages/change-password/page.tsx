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
  Progress,
} from "antd";
import { LockOutlined, ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import styles from "../style.module.css";

const { Title, Text } = Typography;

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 20, label: "Weak", color: "#fc8181" };
  if (score === 2) return { score: 40, label: "Fair", color: "#f6ad55" };
  if (score === 3) return { score: 60, label: "Good", color: "#f6e05e" };
  if (score === 4) return { score: 80, label: "Strong", color: "#68d391" };
  return { score: 100, label: "Very Strong", color: "#48bb78" };
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newPw, setNewPw] = useState("");

  const strength = newPw ? passwordStrength(newPw) : null;

  async function onFinish(values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(body.error ?? "Failed to change password.");
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
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            href="/messages"
            style={{ color: "#718096", marginBottom: 16, padding: 0 }}
          >
            Back to Messages
          </Button>

          <Title level={3} className={styles.loginTitle}>
            Change Password
          </Title>
          <Text className={styles.loginSubtitle}>
            Minimum 12 characters required.
          </Text>

          {success ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <CheckCircleOutlined style={{ fontSize: 48, color: "#48bb78", marginBottom: 16 }} />
              <Title level={4} style={{ color: "#f7fafc" }}>Password Updated</Title>
              <Text style={{ color: "#a0aec0", display: "block", marginBottom: 24 }}>
                Your password has been changed. You will need to log in again next time.
              </Text>
              <Button type="primary" href="/messages" style={{ borderRadius: 8 }}>
                Back to Messages
              </Button>
            </div>
          ) : (
            <>
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
                  name="currentPassword"
                  label={<Text style={{ color: "#a0aec0" }}>Current Password</Text>}
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#4a5568" }} />}
                    placeholder="Current password"
                    autoComplete="current-password"
                    size="large"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label={<Text style={{ color: "#a0aec0" }}>New Password</Text>}
                  rules={[
                    { required: true, message: "Required" },
                    { min: 12, message: "Must be at least 12 characters" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#4a5568" }} />}
                    placeholder="New password (min 12 chars)"
                    autoComplete="new-password"
                    size="large"
                    style={{ borderRadius: 8 }}
                    onChange={(e) => setNewPw(e.target.value)}
                  />
                </Form.Item>

                {strength && (
                  <div style={{ marginTop: -16, marginBottom: 16 }}>
                    <Progress
                      percent={strength.score}
                      showInfo={false}
                      strokeColor={strength.color}
                      trailColor="rgba(99,179,237,0.1)"
                      size="small"
                    />
                    <Text style={{ color: strength.color, fontSize: 12 }}>
                      {strength.label}
                    </Text>
                  </div>
                )}

                <Form.Item
                  name="confirmPassword"
                  label={<Text style={{ color: "#a0aec0" }}>Confirm New Password</Text>}
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: "Required" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Passwords do not match"));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#4a5568" }} />}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
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
                  Update Password
                </Button>
              </Form>
            </>
          )}
        </Card>
      </div>
    </ConfigProvider>
  );
}
