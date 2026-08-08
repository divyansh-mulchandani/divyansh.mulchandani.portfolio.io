"use client";

import {
  ConfigProvider,
  theme,
  Card,
  Col,
  Row,
  Statistic,
  Tag,
  Typography,
  Space,
  Divider,
  Progress,
} from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
  CloudServerOutlined,
  HddOutlined,
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
  memory: {
    totalMB: number;
    freeMB: number;
    usedMB: number;
    usagePercent: number;
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

function memColor(pct: number): string {
  if (pct >= 90) return "#fc8181";
  if (pct >= 70) return "#f6ad55";
  return "#48bb78";
}

function loadColor(load: number, cores: number): string {
  const ratio = load / cores;
  if (ratio >= 1) return "#fc8181";
  if (ratio >= 0.7) return "#f6ad55";
  return "#48bb78";
}

const CARD_STYLE = {
  background: "rgba(13,27,53,0.7)",
  border: "1px solid rgba(99,179,237,0.15)",
};

export default function StatusClient({ data }: { data: StatusData }) {
  const isOk = data.status === "ok";
  const mc = memColor(data.memory.usagePercent);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: { colorPrimary: "#63b3ed", colorBgBase: "#0a0e1a" },
      }}
    >
      <div style={{ minHeight: "100vh", background: "#0a0e1a", padding: "80px 24px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          <Space direction="vertical" size={8} style={{ marginBottom: 32 }}>
            <Text style={{ color: "#63b3ed", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 12 }}>
              System Status
            </Text>
            <Title level={2} style={{ color: "#f7fafc", margin: 0 }}>
              Infrastructure &nbsp;
              {isOk ? (
                <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 14, padding: "2px 12px" }}>
                  Operational
                </Tag>
              ) : (
                <Tag icon={<WarningOutlined />} color="warning" style={{ fontSize: 14, padding: "2px 12px" }}>
                  Degraded
                </Tag>
              )}
            </Title>
            <Text style={{ color: "#718096" }}>
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </Text>
          </Space>

          {/* ── top stat cards ── */}
          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} md={6}>
              <Card style={CARD_STYLE}>
                <Statistic
                  title={<Text style={{ color: "#718096" }}>Uptime</Text>}
                  value={formatUptime(data.uptimeSeconds)}
                  prefix={<ClockCircleOutlined style={{ color: "#63b3ed" }} />}
                  valueStyle={{ color: "#f7fafc", fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={CARD_STYLE}>
                <Statistic
                  title={<Text style={{ color: "#718096" }}>CPU Cores</Text>}
                  value={data.cpuCount}
                  prefix={<DesktopOutlined style={{ color: "#63b3ed" }} />}
                  valueStyle={{ color: "#f7fafc" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={CARD_STYLE}>
                <Statistic
                  title={<Text style={{ color: "#718096" }}>Node.js</Text>}
                  value={data.nodeVersion}
                  prefix={<CloudServerOutlined style={{ color: "#63b3ed" }} />}
                  valueStyle={{ color: "#f7fafc", fontSize: 18 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ background: "rgba(13,27,53,0.7)", border: `1px solid ${data.mongodb === "up" ? "rgba(72,187,120,0.3)" : "rgba(252,129,74,0.3)"}` }}>
                <Statistic
                  title={<Text style={{ color: "#718096" }}>MongoDB</Text>}
                  value={data.mongodb === "up" ? "Connected" : "Unavailable"}
                  prefix={<DatabaseOutlined style={{ color: data.mongodb === "up" ? "#48bb78" : "#fc8149" }} />}
                  valueStyle={{ color: data.mongodb === "up" ? "#48bb78" : "#fc8149", fontSize: 18 }}
                />
              </Card>
            </Col>
          </Row>

          <Divider style={{ borderColor: "rgba(99,179,237,0.1)", margin: "32px 0" }} />

          {/* ── memory + load average ── */}
          <Row gutter={[20, 20]}>

            {/* memory */}
            <Col xs={24} md={10}>
              <Card
                title={
                  <Space>
                    <HddOutlined style={{ color: "#63b3ed" }} />
                    <Text style={{ color: "#a0aec0" }}>Memory</Text>
                  </Space>
                }
                style={CARD_STYLE}
              >
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic
                      title={<Text style={{ color: "#718096", fontSize: 12 }}>Total</Text>}
                      value={`${(data.memory.totalMB / 1024).toFixed(1)} GB`}
                      valueStyle={{ color: "#f7fafc", fontSize: 18 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<Text style={{ color: "#718096", fontSize: 12 }}>Used</Text>}
                      value={`${(data.memory.usedMB / 1024).toFixed(1)} GB`}
                      valueStyle={{ color: mc, fontSize: 18 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<Text style={{ color: "#718096", fontSize: 12 }}>Free</Text>}
                      value={`${(data.memory.freeMB / 1024).toFixed(1)} GB`}
                      valueStyle={{ color: "#48bb78", fontSize: 18 }}
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text style={{ color: "#718096", fontSize: 12 }}>Usage</Text>
                    <Text style={{ color: mc, fontSize: 12, fontWeight: 600 }}>
                      {data.memory.usagePercent}%
                    </Text>
                  </div>
                  <Progress
                    percent={data.memory.usagePercent}
                    showInfo={false}
                    strokeColor={mc}
                    trailColor="rgba(99,179,237,0.1)"
                  />
                </div>
              </Card>
            </Col>

            {/* load average */}
            <Col xs={24} md={14}>
              <Card
                title={<Text style={{ color: "#a0aec0" }}>Load Average</Text>}
                style={CARD_STYLE}
              >
                <Row gutter={[16, 24]}>
                  {[
                    { label: "1 minute", value: data.loadAverage.oneMinute },
                    { label: "5 minutes", value: data.loadAverage.fiveMinutes },
                    { label: "15 minutes", value: data.loadAverage.fifteenMinutes },
                  ].map((item) => {
                    const lc = loadColor(item.value, data.cpuCount);
                    const pct = Math.min((item.value / data.cpuCount) * 100, 100);
                    return (
                      <Col xs={24} sm={8} key={item.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <Text style={{ color: "#718096", fontSize: 12 }}>{item.label}</Text>
                          <Text style={{ color: lc, fontSize: 12, fontWeight: 600 }}>
                            {item.value.toFixed(2)}
                          </Text>
                        </div>
                        <Progress
                          percent={parseFloat(pct.toFixed(1))}
                          showInfo={false}
                          strokeColor={lc}
                          trailColor="rgba(99,179,237,0.1)"
                          size="small"
                        />
                        <Text style={{ color: "#4a5568", fontSize: 11, marginTop: 4, display: "block" }}>
                          {((item.value / data.cpuCount) * 100).toFixed(0)}% of {data.cpuCount} cores
                        </Text>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            </Col>

          </Row>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <a href="/" style={{ color: "#63b3ed", fontSize: 14 }}>
              ← Back to Portfolio
            </a>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
