"use client";

import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  const redirectToPage = (page: "admin" | "student") => {
    router.push(page === "admin" ? "/login" : "/student");
  };

  return (
    <div className="container">
      {/* Header Section */}
      <header className="header">
        <div className="logo">EduLedger</div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1>Tamperproof Transparent Without compromising the security</h1>
        <p>
          EduLedger is a decentralized Trustless Online Examination system that
          transforms how high stakes exams are conducted
        </p>

        <div className="auth-container">
          <button
            className="redirect-btn student"
            onClick={() => redirectToPage("student")}
          >
            🎓 Student Access
          </button>
          <button
            className="redirect-btn admin"
            onClick={() => redirectToPage("admin")}
          >
            🛡️ Admin Access
          </button>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <p>
          &copy; 2025 EduLedger — Revolutionizing Learning Through Blockchain
        </p>
      </footer>

      {/* Styles */}
      <style jsx>{`
        html,
        body {
          height: 100%;
          margin: 0;
          padding: 0;
          font-family: "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(120deg, #1a2980, #26d0ce);
          color: #ffffff;
        }

        .container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
        }

        .nav {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          color: #ffffff;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: #ffd700;
        }

        /* Hero */
        .hero {
          text-align: center;
          padding: 4rem 2rem;
          flex: 1;
        }

        h1 {
          font-size: 2.8rem;
          margin-bottom: 1rem;
          animation: fadeInDown 1s ease-out;
        }

        p {
          font-size: 1.2rem;
          max-width: 750px;
          margin: 0 auto;
          line-height: 1.6;
          animation: fadeInUp 1.2s ease-out;
        }

        .auth-container {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .redirect-btn {
          background: #ffffff;
          color: #1a2980;
          border: none;
          padding: 1rem 2rem;
          border-radius: 40px;
          font-weight: bold;
          cursor: pointer;
          font-size: 1.1rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          min-width: 200px;
        }

        .redirect-btn:hover {
          transform: translateY(-4px) scale(1.03);
          background: #ffd700;
          color: #1a1a1a;
        }

        .student {
          background: linear-gradient(135deg, #43cea2, #185a9d);
          color: #fff;
        }

        .admin {
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          color: #fff;
        }

        .footer {
          text-align: center;
          padding: 1.5rem 0;
          font-size: 0.95rem;
          background: rgba(0, 0, 0, 0.3);
        }

        /* Animations */
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          h1 {
            font-size: 2.2rem;
          }

          .nav {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-end;
          }

          .auth-container {
            flex-direction: column;
            gap: 1.5rem;
          }

          .redirect-btn {
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
