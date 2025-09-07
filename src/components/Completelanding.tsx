"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Zap,
  Lock,
  Eye,
  Fingerprint,
  Mic,
  Award,
  CheckCircle,
  Network,
  Database,
  Code,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Import generated images
import blockchainVerification from "@/assets/blockchain-verification.png";
import blockchainEducation from "@/assets/blockchain-education.png";
import vulnerableIcon from "@/assets/vulnerable-icon.png";
import centralizedIcon from "@/assets/centralized-icon.png";
import clunkyUxIcon from "@/assets/clunky-ux-icon.png";
import Image from "next/image";
import { Router } from "next/router";

// Futuristic Loader Component
const FuturisticLoader = () => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(45, 55, 72, 0.95)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative" }}>
        {/* Outer rotating ring */}
        <motion.div
          style={{
            width: "96px",
            height: "96px",
            border: "2px solid rgba(99, 110, 123, 0.3)",
            borderRadius: "50%",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
        />

        {/* Inner rotating ring */}
        <motion.div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            right: "8px",
            bottom: "8px",
            border: "2px dashed rgba(148, 163, 184, 0.5)",
            borderRadius: "50%",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity }}
        />

        {/* Central pulsing core */}
        <motion.div
          style={{
            position: "absolute",
            top: "32px",
            left: "32px",
            width: "32px",
            height: "32px",
            background: "linear-gradient(135deg, #636E7B, #94A3B8)",
            borderRadius: "50%",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: "4px",
              height: "4px",
              backgroundColor: "#94A3B8",
              borderRadius: "50%",
              left: "50%",
              top: "50%",
              transformOrigin: `${25 + i * 5}px 0px`,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 4 + i * 0.5,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Loading text */}
      <motion.div
        style={{
          position: "absolute",
          bottom: "33.333%",
          textAlign: "center",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 500,
            color: "#F8FAFC",
            marginBottom: "8px",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        >
          Loading Exuproc
        </motion.h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "4px" }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#94A3B8",
                borderRadius: "50%",
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ExuprocLandingComplete = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 },
  };

  // Styles object for reusable styles
  const styles = {
    heroTitle: {
      fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #F8FAFC, #94A3B8)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent",
      lineHeight: 1.1,
      marginBottom: "1.5rem",
    },
    heroSubtitle: {
      fontSize: "clamp(1rem, 2vw, 1.25rem)",
      color: "#94A3B8",
      maxWidth: "32rem",
      margin: "0 auto",
      lineHeight: 1.6,
      marginBottom: "3rem",
    },
    section: {
      padding: "5rem 1rem",
      maxWidth: "80rem",
      margin: "0 auto",
    },
    sectionTitle: {
      fontSize: "clamp(2rem, 6vw, 3rem)",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "4rem",
    },
    card: {
      background: "linear-gradient(145deg, #2D3748, #1A202C)",
      border: "1px solid rgba(148, 163, 184, 0.2)",
      borderRadius: "1rem",
      padding: "1.5rem",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    button: {
      background: "linear-gradient(135deg, #636E7B, #94A3B8)",
      color: "#F8FAFC",
      padding: "1rem 2rem",
      borderRadius: "0.75rem",
      fontWeight: "600",
      fontSize: "1.125rem",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    buttonSecondary: {
      background: "transparent",
      border: "2px solid #636E7B",
      color: "#F8FAFC",
      padding: "1rem 2rem",
      borderRadius: "0.75rem",
      fontWeight: "600",
      fontSize: "1.125rem",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    floatingAnimation: {
      animation: "float 3s ease-in-out infinite",
    },
  };

  // CSS animations as a style tag
  const animations = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .icon-float {
      animation: float 3s ease-in-out infinite;
    }
    .icon-pulse {
      animation: pulse 2s ease-in-out infinite;
    }
  `;

  if (isLoading) {
    return <FuturisticLoader />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1A202C",
        overflow: "hidden",
      }}
    >
      <style>{animations}</style>

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "4rem",
        }}
      >
        {/* Parallax Background */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${blockchainEducation})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Dark Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(26, 32, 44, 0.85)",
            zIndex: 10,
          }}
        />

        {/* Hero Content */}
        <div
          style={{
            position: "relative",
            zIndex: 20,
            textAlign: "center",
            padding: "0 2rem",
            maxWidth: "80rem",
            margin: "0 auto",
          }}
        >
          <motion.h1
            style={styles.heroTitle}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Exuproc: The Future of Secure, Decentralized Examinations
          </motion.h1>

          <motion.p
            style={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Leveraging the power of blockchain and AI-driven proctoring to
            ensure transparent, tamper-proof, and fair online assessments for
            everyone.
          </motion.p>

          <motion.div
            style={{
              display: "flex",
              flexDirection: window.innerWidth < 640 ? "column" : "row",
              gap: "1.5rem",
              justifyContent: "center",
              alignItems: "center",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              style={styles.button}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 16px rgba(99, 110, 123, 0.2)",
              }}
            >
              <Users size={20} />
              Enter as Student
            </motion.button>
            <motion.button
              style={styles.buttonSecondary}
              whileHover={{
                scale: 1.05,
                backgroundColor: "#636E7B",
                color: "#F8FAFC",
              }}
            >
              <Shield size={20} />
              Manage as Admin
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section
        style={{
          ...styles.section,
          backgroundColor: "rgba(45, 55, 72, 0.2)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <motion.h2
            style={{
              ...styles.sectionTitle,
              background: "linear-gradient(135deg, #EF4444, #F8FAFC)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              // Remove textAlign from here
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            Traditional Online Exams Are Broken
          </motion.h2>
        </div>

        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {[
            {
              title: "Vulnerable to Cheating",
              description:
                "Traditional systems lack robust verification, making them susceptible to various forms of academic dishonesty.",
              icon: vulnerableIcon,
            },
            {
              title: "Centralized & Opaque",
              description:
                "Centralized systems create single points of failure and lack transparency in their assessment processes.",
              icon: centralizedIcon,
            },
            {
              title: "Clunky User Experience",
              description:
                "Outdated interfaces and complex workflows create friction for both administrators and students.",
              icon: clunkyUxIcon,
            },
          ].map((problem, index) => (
            <motion.div
              key={problem.title}
              variants={fadeInUp}
              style={{
                ...styles.card,
                textAlign: "center",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(45, 55, 72, 0.4)",
              }}
            >
              <Image
                src={problem.icon}
                alt={problem.title}
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 1.5rem",
                  animation: `float 3s ease-in-out infinite ${index}s`,
                }}
                className="icon-float"
              />
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "#EF4444",
                }}
              >
                {problem.title}
              </h3>
              <p style={{ color: "#94A3B8" }}>{problem.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Solution Section */}
      <section
        style={{
          ...styles.section,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            backgroundImage: `url(${blockchainVerification})`,
            backgroundSize: "300px 300px",
            backgroundRepeat: "repeat",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "100px 100px"],
          }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
        />

        <div style={{ position: "relative", zIndex: 10 }}>
          <motion.h2
            style={{
              ...styles.sectionTitle,
              background: "linear-gradient(135deg, #F8FAFC, #94A3B8)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Redefining Examination Integrity with Web3
          </motion.h2>

          <motion.div
            style={{
              maxWidth: "64rem",
              margin: "0 auto",
              textAlign: "center",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <p
              style={{
                fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
                color: "#94A3B8",
                lineHeight: 1.6,
              }}
            >
              Exuproc is a next-generation examination platform built on the
              blockchain. We provide an end-to-end solution that guarantees the
              integrity of every question, answer, and final score. By deploying
              exams as smart contracts and integrating intelligent proctoring,
              we create an environment of unparalleled trust and security.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Features Section */}
      <section
        style={{
          ...styles.section,
          backgroundColor: "rgba(45, 55, 72, 0.1)",
        }}
      >
        <motion.h2
          style={{
            ...styles.sectionTitle,
            background: "linear-gradient(135deg, #F8FAFC, #94A3B8)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          A Tailored Experience for Every Role
        </motion.h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "3rem",
          }}
        >
          {/* For Administrators */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                color: "#94A3B8",
              }}
            >
              For Administrators
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {[
                {
                  title: "Effortless Exam Creation",
                  description:
                    "Intuitive interface for creating comprehensive exams with various question types and difficulty levels.",
                  icon: Zap,
                  color: "#94A3B8",
                },
                {
                  title: "One-Click Blockchain Deployment",
                  description:
                    "Deploy your exam as a smart contract with a single click, ensuring immutable security.",
                  icon: Network,
                  color: "#636E7B",
                },
                {
                  title: "Comprehensive Admin Dashboard",
                  description:
                    "Real-time monitoring, analytics, and management tools for complete exam oversight.",
                  icon: Database,
                  color: "#94A3B8",
                },
                {
                  title: "Full Control & Monitoring",
                  description:
                    "Advanced proctoring controls and real-time student monitoring capabilities.",
                  icon: Shield,
                  color: "#94A3B8",
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  style={{
                    ...styles.card,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <feature.icon
                    size={32}
                    color={feature.color}
                    className="icon-pulse"
                    style={{ marginTop: "0.25rem", flexShrink: 0 }}
                  />
                  <div>
                    <h4
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        marginBottom: "0.5rem",
                        color: "#F8FAFC",
                      }}
                    >
                      {feature.title}
                    </h4>
                    <p style={{ color: "#94A3B8" }}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* For Students */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            // onClick={route}
          >
            <h3
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "2rem",
                color: "#636E7B",
              }}
            >
              For Students
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {[
                {
                  title: "AI-Powered Proctoring",
                  description:
                    "Advanced AI monitoring ensures fair assessment while respecting privacy and dignity.",
                  icon: Eye,
                  color: "#94A3B8",
                },
                {
                  title: "Verifiable Digital Identity",
                  description:
                    "Blockchain-based identity verification ensures authentic participation in assessments.",
                  icon: Fingerprint,
                  color: "#636E7B",
                },
                {
                  title: "Hands-Free Voice Navigation",
                  description:
                    "Innovative voice controls for seamless exam navigation without traditional input methods.",
                  icon: Mic,
                  color: "#94A3B8",
                },
                {
                  title: "Immutable, Trustworthy Results",
                  description:
                    "Your results are permanently recorded on the blockchain, owned by your wallet address.",
                  icon: Award,
                  color: "#94A3B8",
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  style={{
                    ...styles.card,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <feature.icon
                    size={32}
                    color={feature.color}
                    className="icon-pulse"
                    style={{ marginTop: "0.25rem", flexShrink: 0 }}
                  />
                  <div>
                    <h4
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        marginBottom: "0.5rem",
                        color: "#F8FAFC",
                      }}
                    >
                      {feature.title}
                    </h4>
                    <p style={{ color: "#94A3B8" }}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section style={styles.section}>
        <motion.h2
          style={{
            ...styles.sectionTitle,
            background: "linear-gradient(135deg, #94A3B8, #94A3B8)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Built with a Modern, Cutting-Edge Stack
        </motion.h2>

        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            alignItems: "center",
          }}
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {[
            { name: "Next.js", icon: Code },
            { name: "TypeScript", icon: Cpu },
            { name: "Thirdweb", icon: Network },
            { name: "Solidity", icon: Database },
          ].map((tech, index) => (
            <motion.div
              key={tech.name}
              variants={scaleIn}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                background: "rgba(45, 55, 72, 0.5)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(99, 110, 123, 0.2)",
                borderColor: "rgba(148, 163, 184, 0.3)",
              }}
            >
              <tech.icon
                size={48}
                color="#636E7B"
                className="icon-pulse"
                style={{ marginBottom: "1rem" }}
              />
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  textAlign: "center",
                  color: "#F8FAFC",
                }}
              >
                {tech.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why Blockchain Section */}
      <section
        style={{
          ...styles.section,
          backgroundColor: "rgba(45, 55, 72, 0.2)",
        }}
      >
        <motion.h2
          style={{
            ...styles.sectionTitle,
            background: "linear-gradient(135deg, #F8FAFC, #94A3B8)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          The Blockchain Advantage
        </motion.h2>

        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
          }}
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {[
            {
              title: "Tamper-Proof",
              description:
                "Results are written to a distributed ledger, making them permanent and unchangeable.",
              icon: Lock,
              color: "#94A3B8",
            },
            {
              title: "Decentralized",
              description:
                "No single point of failure. The system is resilient and distributed.",
              icon: Network,
              color: "#636E7B",
            },
            {
              title: "Transparent & Verifiable",
              description:
                "Participants can independently verify exam results on-chain.",
              icon: CheckCircle,
              color: "#94A3B8",
            },
            {
              title: "Ownership",
              description:
                "Students truly own their results, tied to their wallet address.",
              icon: Award,
              color: "#94A3B8",
            },
          ].map((advantage, index) => (
            <motion.div
              key={advantage.title}
              variants={fadeInUp}
              style={{
                ...styles.card,
                textAlign: "center",
                height: "100%",
              }}
              whileHover={{
                y: -10,
                boxShadow: "0 8px 32px rgba(45, 55, 72, 0.3)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <advantage.icon
                size={64}
                color={advantage.color}
                className="icon-pulse"
                style={{ margin: "0 auto 1.5rem" }}
              />
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "#F8FAFC",
                }}
              >
                {advantage.title}
              </h3>
              <p style={{ color: "#94A3B8" }}>{advantage.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section style={styles.section}>
        <div style={{ textAlign: "center" }}>
          <motion.h2
            style={{
              fontSize: "clamp(2rem, 8vw, 4rem)",
              fontWeight: "bold",
              marginBottom: "2rem",
              background: "linear-gradient(135deg, #F8FAFC, #94A3B8, #94A3B8)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            Choose Your Path
          </motion.h2>

          <motion.p
            style={{
              fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
              color: "#94A3B8",
              marginBottom: "3rem",
              maxWidth: "48rem",
              margin: "0 auto 3rem",
              lineHeight: 1.6,
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to see Exuproc in action? Select your role below to enter the
            appropriate dashboard and experience the next generation of
            assessments firsthand.
          </motion.p>

          <motion.div
            style={{
              display: "flex",
              flexDirection: window.innerWidth < 640 ? "column" : "row",
              gap: "2rem",
              justifyContent: "center",
              alignItems: "center",
            }}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <motion.button
                style={{
                  ...styles.button,
                  fontSize: "1.25rem",
                  padding: "1.5rem 3rem",
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Users size={24} />
                Enter as Student
              </motion.button>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <motion.button
                style={{
                  ...styles.buttonSecondary,
                  fontSize: "1.25rem",
                  padding: "1.5rem 3rem",
                }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#636E7B",
                  color: "#F8FAFC",
                }}
              >
                <Shield size={24} />
                Manage as Admin
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "3rem 0",
          borderTop: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            textAlign: "center",
            padding: "0 1rem",
          }}
        >
          <p style={{ color: "#94A3B8" }}>
            © 2024 Exuproc. Securing the future of digital assessments.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ExuprocLandingComplete;
