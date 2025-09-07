"use client";

import React from "react";

const Spinner = () => {
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

export default Spinner;
