
import React from 'react';
import { ArrowLeft, ShieldCheck, Truck, MessageCircle, MapPin, Mail, Phone } from 'lucide-react';
import { formatPrice } from '../lib/utils';

const PageWrapper: React.FC<{ title: string, onBack: () => void, children: React.ReactNode }> = ({ title, onBack, children }) => (
  <div className="min-h-screen bg-stone-50 py-20 px-4">
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors mb-8 font-semibold">
        <ArrowLeft className="w-5 h-5" />
        Back to Shopping
      </button>
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100">
        <h1 className="text-4xl font-bold text-slate-900 mb-8 serif">{title}</h1>
        <div className="prose prose-stone max-w-none text-slate-600 space-y-6">
          {children}
        </div>
      </div>
    </div>
  </div>
);

const PolicyPages = {
  Returns: ({ onBack }: { onBack: () => void }) => (
    <PageWrapper title="Return Policy" onBack={onBack}>
      <div className="flex items-center gap-4 p-6 bg-rose-50 rounded-3xl mb-8">
        <ShieldCheck className="w-8 h-8 text-rose-500" />
        <p className="text-sm font-bold text-rose-800 uppercase tracking-wide">30-Day Money Back Guarantee</p>
      </div>
      <p>At SS Creations, we take immense pride in the quality of our handcrafted gifts. If you are not entirely satisfied with your purchase, we're here to help.</p>
      <h3 className="text-xl font-bold text-slate-800">1. Eligibility for Returns</h3>
      <p>To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Items must be returned within 30 days of delivery.</li>
        <li>Personalized items (engraved, custom names) are non-refundable unless defective.</li>
        <li>Perishable goods like fresh flowers cannot be returned.</li>
      </ul>
      <h3 className="text-xl font-bold text-slate-800">2. Refund Process</h3>
      <p>Once we receive and inspect your item, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original payment method within 5-7 business days.</p>
    </PageWrapper>
  ),
  Delivery: ({ onBack }: { onBack: () => void }) => (
    <PageWrapper title="Delivery Information" onBack={onBack}>
      <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-3xl mb-8">
        <Truck className="w-8 h-8 text-blue-500" />
        <p className="text-sm font-bold text-blue-800 uppercase tracking-wide">Express Nationwide Shipping</p>
      </div>
      <p>We work with the most reliable logistics partners to ensure your precious gifts reach their destination safely and on time.</p>
      <h3 className="text-xl font-bold text-slate-800">1. Shipping Costs</h3>
      <p>We offer a flat-rate shipping fee of {formatPrice(500.00)} for most locations. Orders over {formatPrice(20000.00)} qualify for free standard shipping.</p>
      <h3 className="text-xl font-bold text-slate-800">2. Delivery Timelines</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
          <p className="font-bold text-slate-800 mb-1">Colombo & Suburbs</p>
          <p className="text-xs">Next day delivery</p>
        </div>
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
          <p className="font-bold text-slate-800 mb-1">Island-wide</p>
          <p className="text-xs">2-4 Business Days</p>
        </div>
      </div>
    </PageWrapper>
  ),
  Contact: ({ onBack }: { onBack: () => void }) => (
    <PageWrapper title="Contact Us" onBack={onBack}>
      <p className="mb-8">Have questions about a specific gift or need help with an existing order? Our customer success team is ready to assist you.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-2xl"><Mail className="w-6 h-6 text-rose-500" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Us</p>
              <p className="font-bold text-slate-800">hello@sscreations.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-2xl"><Phone className="w-6 h-6 text-rose-500" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Call/WhatsApp</p>
              <p className="font-bold text-slate-800">+94 70 596 039</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-2xl"><MapPin className="w-6 h-6 text-rose-500" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Studio Address</p>
              <p className="font-bold text-slate-800">123 Artisan Lane, Colombo 07</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
          <MessageCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h4 className="text-xl font-bold mb-2">Live Support</h4>
          <p className="text-slate-400 text-sm mb-6">Chat with us for instant answers regarding gift customization and bulk orders.</p>
          <button 
            onClick={() => window.open('https://wa.me/9470596039')}
            className="w-full py-4 bg-rose-500 hover:bg-rose-600 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            Message on WhatsApp
          </button>
        </div>
      </div>
    </PageWrapper>
  )
};

export default PolicyPages;
