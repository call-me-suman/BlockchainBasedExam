<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exuproc - The Future of Secure, Decentralized Examinations</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            overflow-x: hidden;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* Animated background */
        .animated-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0a0a0a 100%);
            animation: bgPulse 8s ease-in-out infinite alternate;
        }

        .animated-bg::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="%23ffffff" opacity="0.1"><animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite"/></circle><circle cx="80" cy="40" r="1" fill="%23ffffff" opacity="0.1"><animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite"/></circle><circle cx="40" cy="80" r="1" fill="%23ffffff" opacity="0.1"><animate attributeName="opacity" values="0.1;0.2;0.1" dur="5s" repeatCount="indefinite"/></circle></svg>');
        }

        @keyframes bgPulse {
            0% { opacity: 1; }
            100% { opacity: 0.8; }
        }

        /* Hero Section */
        .hero {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }

        .hero-content {
            text-align: center;
            z-index: 2;
            animation: heroFadeIn 1.5s ease-out;
        }

        .logo {
            width: 120px;
            height: auto;
            margin: 0 auto 2rem;
            animation: logoFloat 3s ease-in-out infinite;
            filter: drop-shadow(0 10px 30px rgba(99, 102, 241, 0.3));
        }

        .hero h1 {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: textGlow 2s ease-in-out infinite alternate;
        }

        .hero p {
            font-size: clamp(1rem, 2vw, 1.3rem);
            margin-bottom: 2rem;
            opacity: 0.9;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            animation: slideUp 1s ease-out 0.5s both;
        }

        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            animation: slideUp 1s ease-out 0.8s both;
        }

        .btn {
            padding: 15px 30px;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        }

        .btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.5);
        }

        /* Parallax Elements */
        .parallax-element {
            position: absolute;
            opacity: 0.1;
            animation: float 6s ease-in-out infinite;
        }

        .parallax-1 {
            top: 20%;
            left: 10%;
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 50%;
            animation-delay: 0s;
        }

        .parallax-2 {
            top: 60%;
            right: 15%;
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #f093fb, #f5576c);
            border-radius: 30%;
            animation-delay: 2s;
        }

        .parallax-3 {
            bottom: 20%;
            left: 20%;
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #4facfe, #00f2fe);
            border-radius: 20%;
            animation-delay: 4s;
        }

        /* Section Styles */
        .section {
            padding: 100px 0;
            position: relative;
        }

        .section-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 700;
            text-align: center;
            margin-bottom: 3rem;
            background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .quirky-text {
            position: relative;
            display: inline-block;
        }

        .quirky-text::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 2px;
            animation: underlineExpand 2s ease-in-out infinite alternate;
        }

        /* Problem Section */
        .problems-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .problem-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            transition: all 0.4s ease;
            position: relative;
            overflow: hidden;
        }

        .problem-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
            transform: rotate(45deg);
            transition: all 0.6s ease;
            opacity: 0;
        }

        .problem-card:hover::before {
            opacity: 1;
            animation: shimmer 1.5s ease-in-out;
        }

        .problem-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .problem-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1rem;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            animation: iconPulse 2s ease-in-out infinite;
        }

        /* Features Section */
        .features-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .feature-category {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 20px;
            padding: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.4s ease;
        }

        .feature-category:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: scale(1.02);
        }

        .category-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #667eea;
            text-align: center;
        }

        .feature-item {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 10px;
            transition: all 0.3s ease;
        }

        .feature-item:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateX(10px);
        }

        .feature-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #ffffff;
        }

        .feature-desc {
            font-size: 0.9rem;
            opacity: 0.8;
            line-height: 1.5;
        }

        /* Tech Stack */
        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1.5rem;
            margin-top: 3rem;
        }

        .tech-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.4s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tech-item:hover {
            transform: translateY(-10px) scale(1.05);
            background: rgba(255, 255, 255, 0.1);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.2);
        }

        .tech-name {
            font-weight: 600;
            font-size: 1.1rem;
            margin-top: 1rem;
        }

        /* Blockchain Advantages */
        .advantages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .advantage-card {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            border-radius: 20px;
            padding: 2rem;
            border: 1px solid rgba(102, 126, 234, 0.2);
            transition: all 0.4s ease;
            position: relative;
            overflow: hidden;
        }

        .advantage-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: all 0.8s ease;
        }

        .advantage-card:hover::before {
            left: 100%;
        }

        .advantage-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        }

        .advantage-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #667eea;
        }

        /* Final CTA */
        .final-cta {
            text-align: center;
            padding: 80px 0;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            border-radius: 30px;
            margin: 2rem 0;
        }

        .final-cta h2 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* Animations */
        @keyframes heroFadeIn {
            0% { opacity: 0; transform: translateY(50px); }
            100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes logoFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        @keyframes textGlow {
            0% { filter: brightness(1); }
            100% { filter: brightness(1.2); }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes iconPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        @keyframes underlineExpand {
            0% { width: 0%; }
            100% { width: 100%; }
        }

        /* Scroll Animation Classes */
        .fade-in {
            opacity: 0;
            transform: translateY(50px);
            transition: all 0.8s ease;
        }

        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .slide-left {
            opacity: 0;
            transform: translateX(-50px);
            transition: all 0.8s ease;
        }

        .slide-left.visible {
            opacity: 1;
            transform: translateX(0);
        }

        .slide-right {
            opacity: 0;
            transform: translateX(50px);
            transition: all 0.8s ease;
        }

        .slide-right.visible {
            opacity: 1;
            transform: translateX(0);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .cta-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .btn {
                width: 280px;
                margin: 0.5rem 0;
            }
            
            .problems-grid,
            .advantages-grid,
            .features-container {
                grid-template-columns: 1fr;
            }
            
            .tech-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: #1a1a1a;
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
    </style>
</head>
<body>
    <div class="animated-bg"></div>
    
    <!-- Parallax Elements -->
    <div class="parallax-element parallax-1"></div>
    <div class="parallax-element parallax-2"></div>
    <div class="parallax-element parallax-3"></div>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <img src="/logo_with_name_without_background.png" alt="Exuproc Logo" class="logo">
                <h1>The Future of <span class="quirky-text">Secure</span>, Decentralized Examinations</h1>
                <p>Leveraging the power of blockchain and AI-driven proctoring to ensure transparent, tamper-proof, and fair online assessments for everyone. Welcome to the revolution! 🚀</p>
                <div class="cta-buttons">
                    <a href="#student" class="btn btn-primary">🎓 Enter as Student</a>
                    <a href="#admin" class="btn btn-secondary">⚡ Manage as Admin</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Problem Section -->
    <section class="section">
        <div class="container">
            <h2 class="section-title fade-in">Traditional Online Exams Are <span class="quirky-text">Broken</span> 💔</h2>
            <div class="problems-grid">
                <div class="problem-card fade-in">
                    <div class="problem-icon">🔓</div>
                    <h3>Vulnerable to Cheating</h3>
                    <p>Current systems are easily exploited, compromising the integrity of assessments and making fair evaluation nearly impossible.</p>
                </div>
                <div class="problem-card fade-in">
                    <div class="problem-icon">🏢</div>
                    <h3>Centralized & Opaque</h3>
                    <p>Results can be manipulated, systems can fail, and there's no way to independently verify the authenticity of scores.</p>
                </div>
                <div class="problem-card fade-in">
                    <img src="/clunkyUserEXperience.png" alt="Clunky Experience" style="width: 80px; height: 80px; margin: 0 auto 1rem; border-radius: 50%;">
                    <h3>Clunky User Experience</h3>
                    <p>Complex interfaces, poor accessibility, and frustrating workflows that distract from what matters most - the actual assessment.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Solution Section -->
    <section class="section">
        <div class="container">
            <h2 class="section-title slide-left">Redefining Examination Integrity with <span class="quirky-text">Web3</span> ⛓️</h2>
            <div class="slide-right" style="text-align: center; font-size: 1.2rem; max-width: 800px; margin: 0 auto; opacity: 0.9;">
                <p>Exuproc is a next-generation examination platform built on the blockchain. We provide an end-to-end solution that guarantees the integrity of every question, answer, and final score. By deploying exams as smart contracts and integrating intelligent proctoring, we create an environment of unparalleled trust and security. ✨</p>
            </div>
        </div>
    </section>

    <!-- Core Features Section -->
    <section class="section">
        <div class="container">
            <h2 class="section-title fade-in">A Tailored Experience for <span class="quirky-text">Every Role</span> 🎯</h2>
            <div class="features-container">
                <div class="feature-category slide-left">
                    <h3 class="category-title">👑 For Administrators</h3>
                    <div class="feature-item">
                        <div class="feature-title">🪄 Effortless Exam Creation</div>
                        <div class="feature-desc">Instantly extract questions from uploaded documents (PDF, PNG, JPG) or create them manually with our intuitive interface.</div>
                    </div>
                    <div class="feature-item">
                        <img src="/oneClickBlockchainDeplyment.png" alt="Blockchain Deployment" style="width: 40px; height: 40px; float: left; margin-right: 10px; border-radius: 8px;">
                        <div class="feature-title">One-Click Blockchain Deployment</div>
                        <div class="feature-desc">Securely deploy your entire exam as a smart contract, ensuring it's immutable and tamper-proof.</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-title">📊 Comprehensive Admin Dashboard</div>
                        <div class="feature-desc">Monitor all exams in real-time with filters for In Progress, Scheduled, Expired, and Upcoming.</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-title">🛡️ Full Control & Monitoring</div>
                        <div class="feature-desc">Manage exam schedules and maintain complete oversight from a central, powerful hub.</div>
                    </div>
                </div>

                <div class="feature-category slide-right">
                    <h3 class="category-title">🎓 For Students</h3>
                    <div class="feature-item">
                        <div class="feature-title">👁️ AI-Powered Proctoring</div>
                        <div class="feature-desc">Our system ensures a fair testing environment by monitoring screen activity and requiring fullscreen mode.</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-title">🔐 Verifiable Digital Identity</div>
                        <div class="feature-desc">Connect via your unique wallet address, creating a secure and verifiable link to your exam performance.</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-title">🎤 Hands-Free Voice Navigation</div>
                        <div class="feature-desc">An innovative accessibility feature! Navigate your exam using simple voice commands - just say "next" or "previous"!</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-title">🏆 Immutable, Trustworthy Results</div>
                        <div class="feature-desc">Your final score is recorded permanently on the blockchain, giving you a verifiable record of your achievement.</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Technology Stack Section -->
    <section class="section">
        <div class="container">
            <h2 class="section-title fade-in">Built with a <span class="quirky-text">Modern</span>, Cutting-Edge Stack 🚀</h2>
            <div class="tech-grid">
                <div class="tech-item fade-in">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚡</div>
                    <div class="tech-name">Next.js</div>
                </div>
                <div class="tech-item fade-in">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📘</div>
                    <div class="tech-name">TypeScript</div>
                </div>
                <div class="tech-item fade-in">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🌐</div>
                    <div class="tech-name">Thirdweb</div>
                </div>
                <div class="tech-item fade-in">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💎</div>
                    <div class="tech-name">Solidity</div>
                </div>
                <div class="tech-item fade-in">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔧</div>
                    <div class="tech-name">Ethers.js</div>
                </div>
                <div class="tech-item fade-in">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🤖</div>
                    <div class="tech-name">AI & Web APIs</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Blockchain Advantages Section -->
    <section class="section">
        <div class="container">
            <h2 class="section-title slide-left">The <span class="quirky-text">Blockchain</span> Advantage ⛓️✨</h2>
            <div class="advantages-grid">
                <div class="advantage-card fade-in">
                    <h3 class="advantage-title">🔒 Tamper-Proof</h3>
                    <p>Results are written to a distributed ledger, making them permanent and impossible to alter. Your achievements are set in digital stone!</p>
                </div>
                <div class="advantage-card fade-in">
                    <h3 class="advantage-title">🌐 Decentralized</h3>
                    <p>No single point of failure. The system is resilient, distributed, and always available when you need it most.</p>
                </div>
                <div class="advantage-card fade-in">
                    <h3 class="advantage-title">🔍 Transparent & Verifiable</h3>
                    <p>Participants can independently verify exam results on-chain. Trust through transparency, not through blind faith.</p>
                </div>
                <div class="advantage-card fade-in">
                    <h3 class="advantage-title">👑 True Ownership</h3>
                    <p>Students truly own their results, tied forever to their wallet address. Your success belongs to YOU, not some centralized database.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA Section -->
    <section class="section">
        <div class="container">
            <div class="final-cta fade-in">
                <h2>Choose Your <span class="quirky-text">Path</span> 🛤️</h2>
                <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">Ready to see Exuproc in action? Select your role below to enter the appropriate dashboard and experience the next generation of assessments firsthand! 🎉</p>
                <div class="cta-buttons">
                    <a href="#student" class="btn btn-primary">🎓 Enter as Student</a>
                    <a href="#admin" class="btn btn-secondary">⚡ Manage as Admin</a>
                </div>
            </div>
        </div>
    </section>

    <script>
        // Parallax Effect
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-element');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });

        // Scroll Animation Observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all animated elements
        const animatedElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right');
        animatedElements.forEach(el => observer.observe(el));

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add extra interactive effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.05)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Dynamic cursor effect
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
            opacity: 0;
        `;
        document.body.appendChild(cursor);

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Interactive hover effects for cards
        document.querySelectorAll('.problem-card, .advantage-card, .feature-category').forEach(card => {
            card.addEventListener('mouseenter', function() {
                cursor.style.transform = 'scale(2)';
                this.style.transform = 'translateY(-15px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                cursor.style.transform = 'scale(1)';
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Tech items special effects
        document.querySelectorAll('.tech-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))';
                this.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255, 255, 255, 0.05)';
                this.style.boxShadow = 'none';
            });
        });

        // Add floating particles
        function createFloatingParticle() {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: linear-gradient(45deg, #667eea, #764ba2);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1;
                opacity: 0.6;
                left: ${Math.random() * 100}vw;
                top: 100vh;
                animation: floatUp ${5 + Math.random() * 10}s linear forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 15000);
        }

        // CSS for floating particles animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                to {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Create particles periodically
        setInterval(createFloatingParticle, 2000);

        // Add text typing effect for hero subtitle
        const heroSubtitle = document.querySelector('.hero p');
        const originalText = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        
        let i = 0;
        function typeText() {
            if (i < originalText.length) {
                heroSubtitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeText, 50);
            }
        }
        
        // Start typing effect after hero animation
        setTimeout(typeText, 1500);

        // Add glitch effect to quirky text on hover
        document.querySelectorAll('.quirky-text').forEach(text => {
            text.addEventListener('mouseenter', function() {
                this.style.animation = 'glitch 0.3s ease-in-out';
                this.style.textShadow = `
                    2px 0 #ff0000,
                    -2px 0 #00ffff,
                    4px 0 #ffff00
                `;
            });
            
            text.addEventListener('mouseleave', function() {
                this.style.animation = '';
                this.style.textShadow = 'none';
            });
        });

        // Add glitch keyframe
        const glitchStyle = document.createElement('style');
        glitchStyle.textContent = `
            @keyframes glitch {
                0% { transform: translate(0); }
                20% { transform: translate(-2px, 2px); }
                40% { transform: translate(-2px, -2px); }
                60% { transform: translate(2px, 2px); }
                80% { transform: translate(2px, -2px); }
                100% { transform: translate(0); }
            }
        `;
        document.head.appendChild(glitchStyle);

        // Add progressive loading effect
        window.addEventListener('load', () => {
            document.body.style.overflow = 'auto';
            
            // Stagger animation of elements
            const elements = document.querySelectorAll('.fade-in, .slide-left, .slide-right');
            elements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.transitionDelay = `${index * 0.1}s`;
                }, 100);
            });
        });

        // Add scroll indicator
        const scrollIndicator = document.createElement('div');
        scrollIndicator.innerHTML = `
            <div style="
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
                color: white;
                font-size: 2rem;
                animation: bounce 2s infinite;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            " id="scroll-hint">
                ⬇️
            </div>
        `;
        document.body.appendChild(scrollIndicator);

        // Add bounce animation for scroll indicator
        const bounceStyle = document.createElement('style');
        bounceStyle.textContent = `
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
                40% { transform: translateX(-50%) translateY(-10px); }
                60% { transform: translateX(-50%) translateY(-5px); }
            }
        `;
        document.head.appendChild(bounceStyle);

        // Hide scroll indicator after scrolling
        window.addEventListener('scroll', () => {
            const scrollHint = document.getElementById('scroll-hint');
            if (window.scrollY > 100) {
                scrollHint.style.opacity = '0';
            } else {
                scrollHint.style.opacity = '0.7';
            }
        });

        // Click handler for scroll indicator
        document.getElementById('scroll-hint').addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });

        console.log('🚀 Exuproc Landing Page Loaded Successfully!');
        console.log('💫 All animations and interactions are ready!');
    </script>
</body>
</html>