"use client";

import React, { useState } from "react";
import { Button, Tag, ConfigProvider, theme, Form, Input, Alert } from "antd";
import {
  GithubOutlined,
  LinkedinOutlined,
  MailOutlined,
  MediumOutlined,
  CloudOutlined,
  CodeOutlined,
  MonitorOutlined,
  TrophyOutlined,
  ReadOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { SOCIAL_LINKS } from "@/lib/env";
import styles from "./page.module.css";

const SKILLS = [
  {
    icon: <CloudOutlined />,
    title: "Cloud & Containers",
    tags: ["AWS", "Docker", "Kubernetes", "Helm", "Ansible", "Terraform", "On-premises"],
  },
  {
    icon: <CodeOutlined />,
    title: "Programming",
    tags: ["Python", "Go", "Shell", "Bash"],
  },
  {
    icon: <MonitorOutlined />,
    title: "Platforms",
    tags: ["Red Hat Linux / RHEL", "Rocky Linux", "Wind River Linux"],
  },
  {
    icon: <BranchesOutlined />,
    title: "CI/CD & Automation",
    tags: ["Jenkins", "GitHub Actions", "GitLab CI", "JFrog Artifactory"],
  },
  {
    icon: <DatabaseOutlined />,
    title: "Observability",
    tags: ["Prometheus", "Grafana", "Alerting Rules", "Structured Logging", "Incident Detection"],
  },
  {
    icon: <ReadOutlined />,
    title: "AI / ML",
    tags: ["LangChain", "Claude API", "MCP", "RAG", "Predictive Analytics", "AI/ML in Telecom"],
  },
];

const EXPERIENCE = [
  {
    company: "Altiostar Networks, A Rakuten Symphony Company",
    roles: [
      {
        title: "Senior Member of Technical Staff",
        period: "May 2026 – Present",
        bullets: [
          "Enhancing real-time system performance, monitoring, observability, deployment automation, test automation, CI/CD/CT pipelines, Linux, Kubernetes infrastructure, and platform reliability.",
        ],
      },
      {
        title: "Member of Technical Staff",
        period: "May 2023 – April 2026",
        bullets: [
          "Managed Linux systems and optimized real-time Kubernetes workloads, ensuring 99.8%+ uptime.",
          "Automated IaC provisioning for 20+ physical servers using Terraform.",
          "Built CI/CD pipelines using Jenkins, JFrog, and Ansible, reducing microservices deployment time by 10%.",
          "Performed OS security hardening and compliance configuration per CIS benchmark using OpenSCAP.",
          "Optimized Intel Xeon power states, reducing energy consumption by 5%.",
          "Developed a Python-based CLI tool for system upgrades and rollbacks, streamlining lifecycle management.",
          "Enhanced Go-based application observability, improving incident diagnosis and root cause analysis.",
          "Implemented a Prometheus and Grafana monitoring stack, improving incident detection and response.",
        ],
      },
    ],
  },
  {
    company: "HashedIn by Deloitte",
    roles: [
      {
        title: "Software Engineering Associate Intern",
        period: "March 2023 – May 2023",
        bullets: [
          "Processed CSV datasets using Hadoop, PySpark, Apache Airflow, and Apache Kafka.",
          "Developed a Document-Aware Chatbot using Python, LangChain, and conversational memory.",
          "Built a Project Tracking System using NestJS and Next.js, and a News App using Flutter.",
        ],
      },
    ],
  },
  {
    company: "Crib, Purple Stack Ventures",
    roles: [
      {
        title: "DevOps Intern",
        period: "June 2022 – July 2022",
        bullets: [
          "Automated Amazon S3 backups and alerting using Python, cron, AWS CloudWatch, AWS Lambda, and Slack.",
          "Engineered OTP-based API authentication for service accounts, enhancing security and access control.",
        ],
      },
    ],
  },
];

const CERTIFICATIONS = [
  { name: "AWS Certified Solutions Architect – Associate", icon: "☁️" },
  { name: "AWS Certified Cloud Practitioner", icon: "☁️" },
  { name: "Anthropic: Building with the Claude API", icon: "🤖" },
  { name: "Anthropic: Introduction to Model Context Protocol", icon: "🤖" },
  { name: "Anthropic: Model Context Protocol, Advanced Topics", icon: "🤖" },
  { name: "Apache Kafka Series", icon: "📡" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactForm] = Form.useForm();
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<"success" | "error" | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  async function onContactSubmit(values: { name: string; email: string; message: string }) {
    setSending(true);
    setSendResult(null);
    setSendError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSendResult("success");
        contactForm.resetFields();
      } else {
        setSendResult("error");
        setSendError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setSendResult("error");
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#63b3ed",
          colorBgBase: "#0a0e1a",
        },
      }}
    >
      {/* ── nav ── */}
      <nav className={styles.nav}>
        <span className={styles.navLogo}>DM</span>
        <ul className={styles.navLinks}>
          {["about", "skills", "experience", "projects", "certifications", "contact"].map((s) => (
            <li key={s}>
              <a href={`#${s}`}>{s}</a>
            </li>
          ))}
        </ul>
        <button
          className={styles.navHamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* ── mobile nav ── */}
      {menuOpen && (
        <div className={styles.navMobile}>
          {["about", "skills", "experience", "projects", "certifications", "contact"].map((s) => (
            <a key={s} href={`#${s}`} className={styles.navMobileLink} onClick={() => setMenuOpen(false)}>
              {s}
            </a>
          ))}
        </div>
      )}

      {/* ── hero ── */}
      <section id="hero" className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroName}>Divyansh Mulchandani</h1>
          <p className={styles.heroTitle}>Cloud Platform Engineer · SRE · DevOps · Forward Deployed Engineer · Automation · Backend Engineer</p>
          <p className={styles.heroSummary}>
            Cloud Platform Engineer with 3+ years of experience at a wireless telecom solutions company.
            Proficient in Linux, Docker, Kubernetes, AWS, on-premises cloud infrastructure, and CI/CD.
            Focused on virtualization, containerization, performance optimization, and robust, resilient system design.
          </p>
          <div className={styles.heroActions}>
            <Button
              type="primary"
              size="large"
              href="#contact"
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Get in Touch
            </Button>
            <Button
              size="large"
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              icon={<GithubOutlined />}
              style={{ borderRadius: 8 }}
            >
              GitHub
            </Button>
          </div>
          <div className={styles.heroBadges}>
            {["Kubernetes", "AWS", "Linux", "CI/CD", "Terraform", "OpenRAN", "Automation", "Backend", "FDE"].map((b) => (
              <span key={b} className={styles.heroBadge}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── about ── */}
      <div className={styles.sectionAlt}>
        <section id="about" className={styles.sectionInner}>
          <p className={styles.sectionLabel}>About me</p>
          <h2 className={styles.sectionTitle}>Cloud & Infrastructure <span>Engineer</span></h2>
          <div className={styles.aboutGrid}>
            <div>
              <p className={styles.aboutText}>
                I&apos;m a Cloud Platform Engineer currently working at Altiostar Networks, a Rakuten Symphony Company -
                a leading wireless telecom solutions provider working on open RAN infrastructure.
              </p>
              <p className={styles.aboutText} style={{ marginTop: 16 }}>
                My focus areas include real-time Kubernetes workload optimization, infrastructure automation,
                CI/CD pipeline engineering, security hardening, and building observability stacks with
                Prometheus and Grafana. I hold two AWS certifications and multiple Anthropic certifications.
              </p>
              <p className={styles.aboutText} style={{ marginTop: 16 }}>
                Beyond my current role, I&apos;m interested in distributed systems, cloud-native architectures,
                and the intersection of AI with telecom infrastructure.
              </p>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>3+</div>
                <div className={styles.statLabel}>Years Experience</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>20+</div>
                <div className={styles.statLabel}>Servers Automated</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>99.8%</div>
                <div className={styles.statLabel}>Uptime Achieved</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>2×</div>
                <div className={styles.statLabel}>AWS Certified</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── skills ── */}
      <section id="skills" className={styles.section}>
        <p className={styles.sectionLabel}>What I work with</p>
        <h2 className={styles.sectionTitle}>Technical <span>Skills</span></h2>
        <div className={styles.skillsGrid}>
          {SKILLS.map((cat) => (
            <div key={cat.title} className={styles.skillCategory}>
              <div className={styles.skillCatTitle}>
                {cat.icon}
                {cat.title}
              </div>
              <div className={styles.skillTags}>
                {cat.tags.map((t) => (
                  <span key={t} className={styles.skillTag}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── experience ── */}
      <div className={styles.sectionAlt}>
        <section id="experience" className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Where I&apos;ve worked</p>
          <h2 className={styles.sectionTitle}>Work <span>Experience</span></h2>
          <div className={styles.timeline}>
            {EXPERIENCE.map((job) =>
              job.roles.map((role, ri) => (
                <div key={`${job.company}-${ri}`} className={styles.timelineItem}>
                  {ri === 0 && (
                    <div className={styles.timelineCompany}>{job.company}</div>
                  )}
                  {ri > 0 && <div style={{ height: 4 }} />}
                  <div className={styles.timelineRole}>{role.title}</div>
                  <div className={styles.timelinePeriod}>{role.period}</div>
                  <ul className={styles.timelineBullets}>
                    {role.bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── projects ── */}
      <section id="projects" className={styles.section}>
        <p className={styles.sectionLabel}>What I&apos;ve built</p>
        <h2 className={styles.sectionTitle}>Featured <span>Projects</span></h2>
        <div className={styles.projectsGrid}>
          <div className={styles.projectCard}>
            <div className={styles.projectTitle}>Blockchain-Enabled Supply Chain Automation</div>
            <div className={styles.projectMeta}>May 2023 · Capstone - Vellore Institute of Technology</div>
            <p className={styles.projectDesc}>
              Built a decentralized supply chain framework using Ethereum, IoT, and AI to improve
              traceability, reduce fraud, and enable predictive analytics.
            </p>
            <div className={styles.projectTechTags}>
              {["Ethereum", "IoT", "AI/ML", "Blockchain", "Predictive Analytics"].map((t) => (
                <Tag key={t} color="blue" style={{ borderRadius: 6, marginBottom: 4 }}>{t}</Tag>
              ))}
            </div>
          </div>
          <div className={styles.projectCard}>
            <div className={styles.projectTitle}>Document-Aware Chatbot</div>
            <div className={styles.projectMeta}>2023 · HashedIn by Deloitte Internship</div>
            <p className={styles.projectDesc}>
              Developed a document-aware conversational chatbot using Python, LangChain, and
              conversational memory for automated query handling over large document sets.
            </p>
            <div className={styles.projectTechTags}>
              {["Python", "LangChain", "Apache Kafka", "PySpark", "Apache Airflow"].map((t) => (
                <Tag key={t} color="blue" style={{ borderRadius: 6, marginBottom: 4 }}>{t}</Tag>
              ))}
            </div>
          </div>
          <div className={styles.projectCard}>
            <div className={styles.projectTitle}>Predictive Network Scaling (Patent)</div>
            <div className={styles.projectMeta}>May 2024 · SIPL 2.0 Winner - AI &amp; ML in Telecom</div>
            <p className={styles.projectDesc}>
              Awarded innovation patent for predictive network scaling using FCAPS data.
              Winner of Standard and Implementation Patents League (SIPL) 2.0.
            </p>
            <div className={styles.projectTechTags}>
              {["AI/ML", "Telecom", "FCAPS", "OpenRAN", "Predictive Scaling"].map((t) => (
                <Tag key={t} color="gold" style={{ borderRadius: 6, marginBottom: 4 }}>{t}</Tag>
              ))}
            </div>
          </div>
          <div className={styles.projectCard}>
            <div className={styles.projectTitle}>S3 Backup Automation System</div>
            <div className={styles.projectMeta}>2022 · Crib, Purple Stack Ventures Internship</div>
            <p className={styles.projectDesc}>
              Automated Amazon S3 backups and alerting with Python, cron, AWS CloudWatch, AWS Lambda,
              and Slack notifications. Also engineered OTP-based API authentication for service accounts.
            </p>
            <div className={styles.projectTechTags}>
              {["Python", "AWS Lambda", "AWS CloudWatch", "S3", "Slack API"].map((t) => (
                <Tag key={t} color="blue" style={{ borderRadius: 6, marginBottom: 4 }}>{t}</Tag>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── achievements ── */}
      <div className={styles.sectionAlt}>
        <section id="achievements" className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Recognition</p>
          <h2 className={styles.sectionTitle}>Achievements &amp; <span>Recognitions</span></h2>
          <div className={styles.achieveCard}>
            <TrophyOutlined style={{ fontSize: 40, color: "#f6ad55", flexShrink: 0, marginTop: 4 }} />
            <div>
              <div className={styles.achieveTitle}>SIPL 2.0 Winner - AI &amp; ML in Telecom</div>
              <div className={styles.achieveDate}>May 2024 · Standard and Implementation Patents League</div>
              <p className={styles.achieveDesc}>
                Awarded for innovation in &apos;AI &amp; ML in Telecom&apos; for a patent on predictive network
                scaling using FCAPS data. Recognized by the Standard and Implementation Patents League 2.0
                for significant contribution to telecom infrastructure intelligence.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── certifications ── */}
      <section id="certifications" className={styles.section}>
        <p className={styles.sectionLabel}>Credentials</p>
        <h2 className={styles.sectionTitle}>Certifications &amp; <span>Courses</span></h2>
        <div className={styles.certsGrid}>
          {CERTIFICATIONS.map((c) => (
            <div key={c.name} className={styles.certCard}>
              <span className={styles.certIcon}>{c.icon}</span>
              <span className={styles.certName}>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── education ── */}
      <div className={styles.sectionAlt}>
        <section id="education" className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Background</p>
          <h2 className={styles.sectionTitle}>Education</h2>
          <div className={styles.eduCard}>
            <ReadOutlined style={{ fontSize: 40, color: "#63b3ed", flexShrink: 0, marginTop: 4 }} />
            <div>
              <div className={styles.eduSchool}>Vellore Institute of Technology, Vellore</div>
              <div className={styles.eduDegree}>Bachelor of Technology in Computer Science and Engineering</div>
              <div className={styles.eduPeriod}>2019 – 2023</div>
            </div>
          </div>
        </section>
      </div>

      {/* ── contact ── */}
      <section id="contact" className={styles.section}>
        <p className={styles.sectionLabel}>Let&apos;s connect</p>
        <h2 className={styles.sectionTitle}>Get in <span>Touch</span></h2>
        <div className={styles.contactGrid}>

          {/* left - links */}
          <div>
            <p className={styles.aboutText}>
              I&apos;m open to Cloud Platform Engineering, SRE, DevOps, Forward Deployed Engineering, Automation, Backend Engineering, and Infrastructure Engineering roles.
              Whether you have a project, a question, or just want to say hello - drop me a message.
            </p>
            <div className={styles.contactLinks} style={{ marginTop: 28 }}>
              <a href={`mailto:${SOCIAL_LINKS.email}`} className={styles.contactLink}>
                <MailOutlined className={styles.contactIcon} />
                <div>
                  <div className={styles.contactLabel}>Email</div>
                  <div className={styles.contactValue}>{SOCIAL_LINKS.email}</div>
                </div>
              </a>

              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                <LinkedinOutlined className={styles.contactIcon} />
                <div>
                  <div className={styles.contactLabel}>LinkedIn</div>
                  <div className={styles.contactValue}>linkedin.com/in/divyansh-mulchandani</div>
                </div>
              </a>
              <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                <GithubOutlined className={styles.contactIcon} />
                <div>
                  <div className={styles.contactLabel}>GitHub</div>
                  <div className={styles.contactValue}>github.com/divyansh-mulchandani</div>
                </div>
              </a>
              <a href={SOCIAL_LINKS.medium} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                <MediumOutlined className={styles.contactIcon} />
                <div>
                  <div className={styles.contactLabel}>Medium</div>
                  <div className={styles.contactValue}>medium.com/@divyansh.mulchandani</div>
                </div>
              </a>
            </div>
          </div>

          {/* right - contact form */}
          <div className={styles.contactFormCard}>
            {sendResult === "success" ? (
              <div className={styles.contactSuccess}>
                <CheckCircleOutlined style={{ fontSize: 40, color: "#48bb78", marginBottom: 12 }} />
                <div style={{ color: "#f7fafc", fontWeight: 600, fontSize: "1rem" }}>Message sent!</div>
                <div style={{ color: "#a0aec0", marginTop: 6, fontSize: "0.88rem" }}>
                  Thanks for reaching out. I&apos;ll get back to you soon.
                </div>
                <Button
                  type="link"
                  style={{ marginTop: 12, color: "#63b3ed" }}
                  onClick={() => setSendResult(null)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <Form
                form={contactForm}
                layout="vertical"
                onFinish={onContactSubmit}
                requiredMark={false}
              >
                {sendResult === "error" && (
                  <Alert
                    type="error"
                    message={sendError}
                    showIcon
                    style={{ marginBottom: 16, borderRadius: 8 }}
                    closable
                    onClose={() => setSendResult(null)}
                  />
                )}
                <Form.Item
                  name="name"
                  label={<span style={{ color: "#a0aec0" }}>Name</span>}
                  rules={[{ required: true, message: "Please enter your name" }, { max: 100, message: "Max 100 characters" }]}
                >
                  <Input
                    placeholder="Your name"
                    size="large"
                    style={{ borderRadius: 8, background: "rgba(13,27,53,0.8)", borderColor: "rgba(99,179,237,0.2)", color: "#e2e8f0" }}
                  />
                </Form.Item>
                <Form.Item
                  name="email"
                  label={<span style={{ color: "#a0aec0" }}>Email</span>}
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Enter a valid email address" },
                  ]}
                >
                  <Input
                    placeholder="your@email.com"
                    size="large"
                    style={{ borderRadius: 8, background: "rgba(13,27,53,0.8)", borderColor: "rgba(99,179,237,0.2)", color: "#e2e8f0" }}
                  />
                </Form.Item>
                <Form.Item
                  name="message"
                  label={<span style={{ color: "#a0aec0" }}>Message</span>}
                  rules={[
                    { required: true, message: "Please enter your message" },
                    { max: 2000, message: "Max 2000 characters" },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Tell me about your project or opportunity..."
                    rows={5}
                    style={{ borderRadius: 8, background: "rgba(13,27,53,0.8)", borderColor: "rgba(99,179,237,0.2)", color: "#e2e8f0", resize: "none" }}
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={sending}
                  icon={<SendOutlined />}
                  size="large"
                  block
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  {sending ? "Sending…" : "Send Message"}
                </Button>
              </Form>
            )}
          </div>

        </div>
      </section>

      {/* ── footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          {[
            { href: SOCIAL_LINKS.github, label: "GitHub", icon: <GithubOutlined /> },
            { href: SOCIAL_LINKS.linkedin, label: "LinkedIn", icon: <LinkedinOutlined /> },
            { href: SOCIAL_LINKS.medium, label: "Medium", icon: <MediumOutlined /> },
            { href: `mailto:${SOCIAL_LINKS.email}`, label: "Email", icon: <MailOutlined /> },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              {l.icon} {l.label}
            </a>
          ))}
        </div>
        <p>© {new Date().getFullYear()} Divyansh Mulchandani. Built with Next.js &amp; Ant Design.</p>
      </footer>
    </ConfigProvider>
  );
}
