'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, X, Eye, EyeOff, Menu, XIcon } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/crm/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050A10]">
      {/* ── Minimalist Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'glass-nav py-3 md:py-4' : 'bg-gradient-to-b from-black/60 to-transparent py-4 md:py-6'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg sm:text-xl md:text-2xl font-display font-medium text-white tracking-widest uppercase">
              Pentahouse
            </span>
          </div>
          <div className="flex items-center">
            <button 
              className="px-5 py-2 sm:px-8 sm:py-3 rounded-full border border-[#C5A565]/50 text-[#C5A565] uppercase tracking-[0.1em] sm:tracking-[0.15em] text-[10px] sm:text-xs font-semibold hover:bg-[#C5A565] hover:text-[#050A10] transition-all duration-500 shadow-[0_0_20px_rgba(197,165,101,0.1)] hover:shadow-[0_0_30px_rgba(197,165,101,0.4)] backdrop-blur-sm" 
              onClick={() => setShowLogin(true)}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Client Login
            </button>
          </div>
        </div>
      </nav>

      {/* ── Cinematic Hero ── */}
      <section id="home" className="relative h-screen w-full flex items-end pb-16 md:pb-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02] transform transition-transform duration-[20s] hover:scale-105"
          style={{ backgroundImage: "url('/images/hero_bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050A10] via-black/40 to-transparent" />
        
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="max-w-4xl animate-fade-up">
            <h1 className="text-fluid-h1 font-display font-medium text-white mb-6 uppercase tracking-tighter">
              Defining the <br />
              <span className="text-[#C5A565] italic font-light tracking-normal">Future</span> of Space.
            </h1>
            <p className="text-fluid-body text-gray-300 mb-10 max-w-xl font-light">
              Elevating architectural standards through precision engineering, visionary design, and unparalleled craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <a href="#vision" className="btn-gold-solid">
                Discover Our Vision
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Minimalist Stats ── */}
      <section className="py-16 lg:py-20 border-b border-white/5 bg-[#020406]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {[
              { value: '200+', label: 'Projects Completed' },
              { value: '15', label: 'Years of Excellence' },
              { value: '500+', label: 'Global Clients' },
              { value: '50+', label: 'Industry Experts' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col border-l border-white/10 pl-6 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-display font-light text-white mb-2">{stat.value}</div>
                <div className="text-xs uppercase tracking-widest text-[#9CA3AF] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Asymmetrical Vision Section ── */}
      <section id="vision" className="py-16 md:py-24 lg:py-32 bg-[#050A10]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 reveal-wrapper rounded-sm">
              <img src="/images/about_arch.png" alt="Modern Architecture" className="w-full h-auto object-cover reveal-image" />
            </div>
            <div className="order-1 lg:order-2 animate-fade-up">
              <span className="text-[#C5A565] text-xs uppercase tracking-[0.2em] font-semibold mb-6 block">Our Philosophy</span>
              <h2 className="text-fluid-h2 font-display font-medium text-white mb-8">
                Mastery in every <br/> single detail.
              </h2>
              <p className="text-lg text-gray-400 font-light leading-relaxed mb-10">
                At Pentahouse, we believe that true luxury lies in the details that others overlook. From the foundational engineering to the final aesthetic touches, our approach is uncompromising. We create spaces that don't just exist, but resonate.
              </p>
              <a href="#services" className="btn-nav-link text-sm inline-flex items-center gap-2">
                Explore Services <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Sticky Layout ── */}
      <section id="services" className="py-16 md:py-24 lg:py-32 bg-[#020406] relative">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            <div className="lg:w-1/3 lg:sticky lg:top-32 self-start">
              <span className="text-[#C5A565] text-xs uppercase tracking-[0.2em] font-semibold mb-6 block">Capabilities</span>
              <h2 className="text-fluid-h3 font-display font-medium text-white mb-6">
                Comprehensive <br/> Expertise.
              </h2>
              <p className="text-gray-400 font-light mb-8">
                End-to-end solutions for the most demanding architectural and construction requirements.
              </p>
            </div>
            <div className="lg:w-2/3 space-y-24">
              {[
                { title: 'Residential Development', desc: 'Crafting bespoke luxury homes and high-end residential complexes that redefine modern living.' },
                { title: 'Commercial Architecture', desc: 'Designing state-of-the-art office spaces and retail environments engineered for the future of business.' },
                { title: 'Premium Interior Design', desc: 'Curating elegant, highly functional interior spaces using exclusive materials and meticulous craftsmanship.' }
              ].map((service, i) => (
                <div key={i} className="group border-t border-white/10 pt-12 animate-fade-up">
                  <h3 className="text-2xl md:text-3xl font-display text-white mb-4 transition-colors group-hover:text-[#C5A565]">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 font-light leading-relaxed max-w-xl">
                    {service.desc}
                  </p>
                </div>
              ))}
              
              <div className="reveal-wrapper mt-16 rounded-sm">
                <img src="/images/services_abstract.png" alt="Abstract architectural details" className="w-full h-80 object-cover reveal-image grayscale opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Typographic Why Choose Us ── */}
      <section className="py-16 md:py-24 lg:py-32 bg-[#050A10]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-up">
            <h2 className="text-fluid-h3 font-display font-medium text-white mb-6">
              The Pentahouse Standard
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: '01', title: 'Uncompromising Quality', desc: 'We source only premium materials globally, ensuring every structure stands the test of time and trends.' },
              { num: '02', title: 'Precision Management', desc: 'Our proprietary CRM and management systems ensure absolute transparency and timely delivery.' },
              { num: '03', title: 'Visionary Design', desc: 'We collaborate with world-class architects to push the boundaries of what is structurally and aesthetically possible.' }
            ].map((feature, i) => (
              <div key={i} className="border-t border-[#C5A565]/30 pt-8 animate-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
                <span className="text-sm font-display text-[#C5A565] mb-4 block">{feature.num}</span>
                <h4 className="text-xl font-display text-white mb-4">{feature.title}</h4>
                <p className="text-gray-400 font-light leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" className="bg-[#020406] pt-16 md:pt-24 lg:pt-32 pb-8 border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 mb-24">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-medium text-white mb-8">
                Let's discuss <br/> your next project.
              </h2>
              <a href="mailto:contact@pentahouse.com" className="text-xl md:text-2xl text-[#C5A565] hover:text-white transition-colors font-light">
                contact@pentahouse.com
              </a>
            </div>
            <div className="grid grid-cols-2 gap-8 md:justify-items-end text-sm">
              <div className="space-y-4 flex flex-col">
                <span className="text-gray-500 uppercase tracking-widest font-semibold text-xs mb-2">Navigation</span>
                <a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a>
                <a href="#vision" className="text-gray-300 hover:text-white transition-colors">Vision</a>
                <a href="#services" className="text-gray-300 hover:text-white transition-colors">Services</a>
              </div>
              <div className="space-y-4 flex flex-col">
                <span className="text-gray-500 uppercase tracking-widest font-semibold text-xs mb-2">Social</span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Instagram</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Twitter</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-8 text-xs text-gray-500 font-light">
            <span>© 2026 Pentahouse Constructions. All rights reserved.</span>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Login Drawer ── */}
      {showLogin && <LoginDrawer onClose={() => setShowLogin(false)} />}
    </div>
  );
}

// ── Login Drawer Component ──
function LoginDrawer({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(username, password);
      if (ok) {
        router.push('/crm/dashboard');
      } else {
        setError('Invalid credentials.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
        <div 
          className="w-full max-w-[420px] bg-[#0F1621] p-6 sm:p-10 rounded-2xl border border-white/10 shadow-2xl flex flex-col relative animate-fade-up overflow-hidden" 
          onClick={e => e.stopPropagation()}
        >
          {/* Subtle Top Gold Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A565] to-transparent opacity-50"></div>
          
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>Client Portal</h2>
              <p className="text-sm text-gray-400 mt-1 font-light">Secure Enterprise Access</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#C5A565] font-semibold mb-2">Username</label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C5A565] focus:bg-white/10 transition-all text-sm shadow-inner"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                required
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#C5A565] font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C5A565] focus:bg-white/10 pr-10 transition-all text-sm shadow-inner"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ colorScheme: 'dark' }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 font-light bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full !mt-8 py-3.5 px-6 bg-[#C5A565] rounded-lg text-[#050A10] uppercase tracking-[0.1em] text-sm font-semibold hover:bg-white hover:text-[#050A10] shadow-[0_0_20px_rgba(197,165,101,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-300"
              disabled={loading}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span>{loading ? 'Authenticating...' : 'Secure Sign In'}</span>
            </button>
          </form>
          
          <div className="mt-8 pt-6 text-[10px] uppercase tracking-widest text-gray-500 font-light text-center border-t border-white/5">
            Secured by Pentahouse Enterprise
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
