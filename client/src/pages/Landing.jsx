import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, 
  Zap, Star, Award, Users, ShoppingBag, ChevronRight, CheckCircle2 
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Electronics & Gadgets', icon: '📱', color: 'from-blue-500/10 to-indigo-500/10', count: '1,200+ Products', desc: 'Latest smartphones, audio & smart home' },
  { name: 'Trending Fashion', icon: '👕', color: 'from-pink-500/10 to-rose-500/10', count: '4,500+ Items', desc: 'Streetwear, formal & seasonal collections' },
  { name: 'Home Appliances', icon: '🏠', color: 'from-amber-500/10 to-orange-500/10', count: '850+ Appliances', desc: 'Modern living & kitchen essentials' },
  { name: 'Beauty & Skincare', icon: '💄', color: 'from-purple-500/10 to-fuchsia-500/10', count: '1,100+ Products', desc: 'Clean, verified beauty & personal care' },
  { name: 'Fresh Supermarket', icon: '🛒', color: 'from-emerald-500/10 to-teal-500/10', count: '3,200+ Items', desc: 'Organic produce & everyday pantry' },
  { name: 'Gaming & Toys', icon: '🧸', color: 'from-indigo-500/10 to-cyan-500/10', count: '600+ Items', desc: 'Consoles, collectibles & board games' },
];

const FEATURED_PERKS = [
  {
    icon: <Truck className="w-6 h-6 text-blue-600" />,
    title: 'Free Express Shipping',
    desc: 'Instant 24-48 hour delivery on all domestic orders over ₹499 with real-time GPS tracking.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    title: 'Authenticity Guarantee',
    desc: '100% genuine products sourced directly from authorized brand manufacturers.',
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-purple-600" />,
    title: '30-Day Easy Returns',
    desc: 'Zero-hassle instant refunds and free doorstep pickup for eligible returns.',
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-600" />,
    title: 'Member Exclusive Flash Deals',
    desc: 'Access secret 50-70% discount drops every weekend only on ShopKart.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Jenkins',
    role: 'Verified Buyer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    comment: 'ShopKart has completely transformed my online shopping. Delivery was under 24 hours and the packaging was flawless!',
    rating: 5,
  },
  {
    name: 'Alex Rivera',
    role: 'Tech Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    comment: 'Scored the S24 Ultra on a flash sale for 25% off. Unbeatable pricing and customer support was super helpful.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Fashion Blogger',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    comment: 'The curated fashion collections are so on-point. Quality is top notch and returns are completely seamless.',
    rating: 5,
  },
];

export default function Landing() {
  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-gray-50/40 pt-12 pb-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Welcome to the Next-Gen Shopping Experience</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
                Everything you love, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
                  delivered in a heartbeat.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover over 50,000+ verified premium gadgets, streetwear, lifestyle essentials, and organic groceries at unbeatable member prices.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/home"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
                >
                  <ShoppingBag className="w-5 h-5" /> Explore Storefront <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-bold px-8 py-4 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition flex items-center justify-center gap-2 text-base"
                >
                  Create Account
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-200/70 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">50K+</div>
                  <div className="text-xs text-gray-500 font-medium">Curated Items</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">99.8%</div>
                  <div className="text-xs text-gray-500 font-medium">Happy Shoppers</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">24hr</div>
                  <div className="text-xs text-gray-500 font-medium">Fast Dispatch</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visuals */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Card */}
                <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-gray-800">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      🔥 Weekend Drop
                    </span>
                    <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 (1.4k reviews)
                    </span>
                  </div>

                  <div className="h-48 sm:h-56 w-full flex items-center justify-center my-2">
                    <img 
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" 
                      alt="Sony Headphones" 
                      className="h-full object-contain drop-shadow-2xl transform hover:scale-105 transition duration-500" 
                    />
                  </div>

                  <div className="mt-4">
                    <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Premium Sound</span>
                    <h3 className="text-xl font-bold text-white mt-1">Sony WH-1000XM5 Studio Edition</h3>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <div>
                        <div className="text-2xl font-black text-white">₹24,999</div>
                        <div className="text-xs text-gray-400 line-through">₹29,999</div>
                      </div>
                      <Link 
                        to="/home" 
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md flex items-center gap-1.5"
                      >
                        View in Store <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating Member Perk Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Member Discount</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">Extra 15% off first order</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Value Proposition Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2">Why ShopKart?</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Designed for convenience, speed, and complete peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PERKS.map((perk, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition duration-300 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                {perk.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{perk.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Categories Exploration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Departments</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Explore Popular Categories</h2>
            <p className="text-sm text-gray-500 mt-1">Handpicked collections across all our top departments</p>
          </div>
          <Link 
            to="/home" 
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            Browse All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <Link 
              key={idx}
              to="/home" 
              className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex items-start justify-between"
            >
              <div>
                <div className="text-4xl mb-4 p-3 rounded-2xl bg-gray-50 inline-block group-hover:scale-110 transition duration-300">
                  {cat.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
                <span className="inline-block mt-3 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {cat.count}
                </span>
              </div>
              <div className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Big Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="z-10 max-w-xl space-y-4 text-center lg:text-left">
            <span className="bg-yellow-400 text-gray-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Limited Time Special
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Sign up today and get 20% off your entire first purchase.
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Unlock free standard shipping on every order, early access to lightning sales, and easy 1-click checkout.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link 
                to="/register" 
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-7 py-3.5 rounded-2xl shadow-lg transition transform hover:-translate-y-0.5 text-sm"
              >
                Claim My 20% Coupon
              </Link>
              <Link 
                to="/login" 
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-2xl border border-white/20 transition text-sm"
              >
                Sign In to Account
              </Link>
            </div>
          </div>

          <div className="z-10 flex items-center gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl sm:text-4xl font-black text-yellow-300">20%</div>
              <div className="text-xs text-white/80 mt-1 font-medium">Welcome Coupon</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-300">₹0</div>
              <div className="text-xs text-white/80 mt-1 font-medium">Delivery Fee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Verified Reviews</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Loved by thousands of shoppers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="text-xs font-bold text-gray-900">{t.name}</div>
                  <div className="text-[11px] text-gray-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
