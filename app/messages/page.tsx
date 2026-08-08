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
  Tooltip,
  Progress,
  Statistic,
  Row,
  Col,
  Popconfirm,
  message as antMessage,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  LogoutOutlined,
  MailOutlined,
  HomeOutlined,
  ReloadOutlined,
  KeyOutlined,
  DatabaseOutlined,
  RotateRightOutlined,
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

interface CollectionStats {
  totalDocs: number;
  sizeMB: number;
  storageSizeMB: number;
  limitMB: number;
  usagePercent: number;
  lastRotation: string | null;
}

function strokeColor(pct: number): string {
  if (pct >= 90) return "#fc8181";
  if (pct >= 70) return "#f6ad55";
  return "#48bb78";
}

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [rotating, setRotating] = useState(false);

  async function fetchMessages() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", { credentials: "include" });
      if (res.status === 401) { router.push("/messages/login"); return; }
      if (!res.ok) throw new Error("Failed to load messages.");
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats ?? null);
      }
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/messages/login");
  }

  async function handleRotate() {
    setRotating(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "rotate" }),
      });
      const data = await res.json();
      if (res.ok) {
        const r = data.result;
        if (r.rotated) {
          antMessage.success(
            `Rotation complete: ${r.deletedCount} messages removed. ${r.sizeBeforeMB} MB → ${r.sizeAfterMB} MB`
          );
        } else {
          antMessage.info(`No rotation needed — collection is under 512 MB (${r.sizeBeforeMB} MB used).`);
        }
        fetchStats();
        fetchMessages();
      } else {
        antMessage.error(data.error ?? "Rotation failed.");
      }
    } catch {
      antMessage.error("Network error during rotation.");
    } finally {
      setRotating(false);
    }
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
        <a href={`mailto:${v}`} style={{ color: "#63b3ed" }}>{v}</a>
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
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => { fetchMessages(); fetchStats(); }} loading={loading} style={{ borderRadius: 8 }}>
                Refresh
              </Button>
              <Button icon={<HomeOutlined />} href="/" style={{ borderRadius: 8 }}>
                Portfolio
              </Button>
              <Button icon={<KeyOutlined />} href="/messages/change-password" style={{ borderRadius: 8 }}>
                Change Password
              </Button>
              <Popconfirm
                title="Rotate data"
                description="Delete oldest messages until collection is under 512 MB. Continue?"
                onConfirm={handleRotate}
                okText="Rotate"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button icon={<RotateRightOutlined />} loading={rotating} style={{ borderRadius: 8 }}>
                  Rotate Data
                </Button>
              </Popconfirm>
              <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout} style={{ borderRadius: 8 }}>
                Sign Out
              </Button>
            </Space>
          </div>

          {stats && (
            <div className={styles.statsBar}>
              <Row gutter={[20, 16]} align="middle">
                <Col xs={24} sm={6}>
                  <Statistic
                    title={<Text style={{ color: "#718096", fontSize: 12 }}>Total Messages</Text>}
                    value={stats.totalDocs}
                    prefix={<DatabaseOutlined style={{ color: "#63b3ed" }} />}
                    valueStyle={{ color: "#f7fafc", fontSize: 20 }}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Statistic
                    title={<Text style={{ color: "#718096", fontSize: 12 }}>Data Size</Text>}
                    value={`${stats.sizeMB} MB`}
                    valueStyle={{ color: "#f7fafc", fontSize: 20 }}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Statistic
                    title={<Text style={{ color: "#718096", fontSize: 12 }}>Last Rotation</Text>}
                    value={stats.lastRotation ? new Date(stats.lastRotation).toLocaleDateString() : "Never"}
                    valueStyle={{ color: stats.lastRotation ? "#f7fafc" : "#4a5568", fontSize: 16 }}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Text style={{ color: "#718096", fontSize: 12 }}>
                    Storage Limit (512 MB)
                  </Text>
                  <Progress
                    percent={stats.usagePercent}
                    strokeColor={strokeColor(stats.usagePercent)}
                    trailColor="rgba(99,179,237,0.1)"
                    format={(p) => <span style={{ color: strokeColor(stats.usagePercent) }}>{p}%</span>}
                    style={{ marginTop: 6 }}
                  />
                </Col>
              </Row>
            </div>
          )}

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
