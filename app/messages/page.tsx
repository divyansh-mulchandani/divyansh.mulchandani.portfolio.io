"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Table,
  ConfigProvider,
  theme,
  Typography,
  Space,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  LogoutOutlined,
  MailOutlined,
  HomeOutlined,
  ReloadOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import styles from "./style.module.css";

const { Title, Text } = Typography;

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchMessages() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", { credentials: "include" });
      if (res.status === 401) {
        router.push("/messages/login");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load messages.");
      }
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/messages/login");
  }

  const columns: ColumnsType<Message> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (v: string) => <Text style={{ color: "#e2e8f0" }}>{v}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (v: string) => (
        <a href={`mailto:${v}`} style={{ color: "#63b3ed" }}>
          {v}
        </a>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (v: string) => (
        <Tooltip title={v}>
          <span className={styles.messageText}>
            {v.length > 80 ? v.slice(0, 80) + "…" : v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Received",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => (
        <Text style={{ color: "#718096", fontSize: 12 }}>
          {new Date(v).toLocaleString()}
        </Text>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorPrimary: "#63b3ed", colorBgBase: "#0a0e1a" },
        components: {
          Table: {
            headerBg: "rgba(13,27,53,0.9)",
            headerColor: "#63b3ed",
            rowHoverBg: "rgba(99,179,237,0.05)",
            borderColor: "rgba(99,179,237,0.12)",
            colorBgContainer: "transparent",
          },
        },
      }}
    >
      <div className={styles.wrapper}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <div>
              <div className={styles.label}>Admin Dashboard</div>
              <Title level={3} className={styles.title}>
                <MailOutlined style={{ marginRight: 10, color: "#63b3ed" }} />
                Contact Messages
              </Title>
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchMessages}
                loading={loading}
                style={{ borderRadius: 8 }}
              >
                Refresh
              </Button>
              <Button
                icon={<HomeOutlined />}
                href="/"
                style={{ borderRadius: 8 }}
              >
                Portfolio
              </Button>
              <Button
                icon={<KeyOutlined />}
                href="/messages/change-password"
                style={{ borderRadius: 8 }}
              >
                Change Password
              </Button>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ borderRadius: 8 }}
              >
                Sign Out
              </Button>
            </Space>
          </div>

          {error ? (
            <div className={styles.errorState}>
              <Text style={{ color: "#fc8149" }}>{error}</Text>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <Table<Message>
                dataSource={messages}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 20, showSizeChanger: false }}
                locale={{
                  emptyText: (
                    <div className={styles.emptyState}>
                      <MailOutlined style={{ fontSize: 40, color: "#2d3a5a", marginBottom: 12 }} />
                      <div>No messages yet</div>
                    </div>
                  ),
                }}
                summary={() =>
                  messages.length > 0 ? (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text style={{ color: "#718096", fontSize: 12 }}>
                          {messages.length} message{messages.length !== 1 ? "s" : ""} total
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  ) : null
                }
              />
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}
