"use client";

import {
  ConfigProvider,
  theme,
  Card,
  Col,
  Row,
  Statistic,
  Badge,
  Tag,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface StatusData {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  nodeVersion: string;
  cpuCount: number;
  loadAverage: {
    oneMinute: number;
    fiveMinutes: number;
    fifteenMinutes: number;
  };
  mongodb: string;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function StatusClient({ data }: { data: StatusData }) {
  const isOk = data.status === "ok";

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
          padding: "80px 24px 40px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Space direction="vertical" size={8} style={{ marginBottom: 32 }}>
            <Text style={{ color: "#63b3ed", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 12 }}>
              System Status
            </Text>
            <Title level={2} style={{ color: "#f7fafc", margin: 0 }}>
              Infrastructure &nbsp;
              {isOk ? (
                <Tag
                  icon={<CheckCircleOutlined />}
                  color="success"
                  style={{ fontSize: 14, padding: "2px 12px" }}
                >
                  Operational
                </Tag>
              ) : (
                <Tag
                  icon={<WarningOutlined />}
                  color="warning"
                  style={{ fontSize: 14, padding: "2px 12px" }}
                >
                  Degraded
                </Tag>
              )}
            </Title>
            <Text style={{ color: "#718096" }}>
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </Text>
          </Space>

          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{ background: "rgba(13,27,53,0.7)", border: "1px solid rgba(99,179,237,0.15)" }}
              >
                <Statistic
                  title={<Text style={{ color: "#718096" }}>Uptime</Text>}
                  value={formatUptime(data.uptimeSeconds)}
                  prefix={<ClockCircleOutlined style={{ color: "#63b3ed" }} />}
                  valueStyle={{ color: "#f7fafc", fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{ background: "rgba(13,27,53,0.7)", border: "1px solid rgba(99,179,237,0.15)" }}
              >
                <Statistic
                  title={<Text style={{ color: "#718096" }}>CPU Cores</Text>}
                  value={data.cpuCount}
                  prefix={<DesktopOutlined style={{ color: "#63b3ed" }} />}
                  valueStyle={{ color: "#f7fafc" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{ background: "rgba(13,27,53,0.7)", border: "1px solid rgba(99,179,237,0.15)" }}
              >
                <Statistic
                  title={<Text style={{ color: "#718096" }}>Node.js</Text>}
                  value={data.nodeVersion}
                  prefix={<CloudServerOutlined style={{ color: "#63b3ed" }} />}
                  valueStyle={{ color: "#f7fafc", fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                style={{
                  background: "rgba(13,27,53,0.7)",
                  border: `1px solid ${data.mongodb === "up" ? "rgba(72,187,120,0.3)" : "rgba(252,129,74,0.3)"}`,
                }}
              >
                <Statistic
                  title={<Text style={{ color: "#718096" }}>MongoDB</Text>}
                  value={data.mongodb === "up" ? "Connected" : "Unavailable"}
                  prefix={<DatabaseOutlined style={{ color: data.mongodb === "up" ? "#48bb78" : "#fc8149" }} />}
                  valueStyle={{ color: data.mongodb === "up" ? "#48bb78" : "#fc8149", fontSize: 18 }}
                />
              </Card>
            </Col>
          </Row>

          <Divider style={{ borderColor: "rgba(99,179,237,0.1)", marginTop: 32 }} />

          <Card
            title={<Text style={{ color: "#a0aec0" }}>Load Average</Text>}
            style={{ background: "rgba(13,27,53,0.7)", border: "1px solid rgba(99,179,237,0.15)" }}
          >
            <Row gutter={[20, 20]}>
              {[
                { label: "1 minute", value: data.loadAverage.oneMinute },
                { label: "5 minutes", value: data.loadAverage.fiveMinutes },
                { label: "15 minutes", value: data.loadAverage.fifteenMinutes },
              ].map((item) => (
                <Col xs={24} sm={8} key={item.label}>
                  <Statistic
                    title={<Text style={{ color: "#718096" }}>{item.label}</Text>}
                    value={item.value.toFixed(2)}
                    valueStyle={{ color: "#63b3ed", fontSize: 24 }}
                  />
                </Col>
              ))}
            </Row>
          </Card>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <a href="/" style={{ color: "#63b3ed", fontSize: 14 }}>
              ← Back to Portfolio
            </a>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
