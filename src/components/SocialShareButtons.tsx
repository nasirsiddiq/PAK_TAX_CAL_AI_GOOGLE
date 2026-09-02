import React from 'react';
import { Share2, Facebook, MessageCircle, Mail, Link2, Copy } from 'lucide-react';

interface SocialShareProps {
  title: string;
  description: string;
  imageUrl?: string;
  calculatorType: 'salary-tax' | 'provincial' | 'reverse' | 'wht' | 'sales-tax' | 'zakat' | 'specialized' | 'filer-matrix' | 'slabs';
  url?: string;
  amount?: string; // For displaying result amount
}

export const SocialShareButtons: React.FC<SocialShareProps> = ({
  title,
  description,
  imageUrl,
  calculatorType,
  url = typeof window !== 'undefined' ? window.location.href : '',
  amount,
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const shareText = amount 
    ? encodeURIComponent(`${title}\n\nCalculated Amount: ${amount}\n\n${description}`)
    : encodeURIComponent(`${title}\n\n${description}`);

  const calculatorImages: Record<string, string> = {
    'salary-tax': '📊 Salary Tax Calculator - Calculate your monthly/annual income tax instantly',
    'provincial': '🏛️ Provincial Tax Calculator - PRA, SRB, KPRA, BRA taxes',
    'reverse': '🔄 Reverse Tax Calculator - Convert net salary to gross',
    'wht': '📉 Withholding Tax Calculator - Calculate WHT on various income sources',
    'sales-tax': '🛒 Sales Tax Calculator - GST and provincial sales tax rates',
    'zakat': '🕌 Zakat Calculator - Calculate your Zakat obligation',
    'specialized': '🏠 Property & Car Tax Calculator - Property transfers, vehicle tokens, IT exports',
    'filer-matrix': '✅ Filer vs Non-Filer Matrix - Understand filing requirements',
    'slabs': '📋 FBR Tax Slabs Table - View all official tax slabs',
  };

  const shortDescription = `${calculatorImages[calculatorType]} - Use this FBR-compliant calculator for accurate tax calculations in Pakistan.`;

  // Social media share URLs
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=PakistanTax,FBR,TaxCalculator`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const copyToClipboard = () => {
    const shareMessage = `${title}\n${shortDescription}\n\n${url}`;
    navigator.clipboard.writeText(shareMessage);
    alert('Copied to clipboard!');
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-slate-900">Share This Calculator</h3>
      </div>

      <p className="text-sm text-slate-600 mb-6">
        {shortDescription}
      </p>

      {/* Social Media Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition group"
          title="Share on Facebook"
        >
          <Facebook className="w-6 h-6 text-blue-600 group-hover:scale-110 transition" />
          <span className="text-xs font-semibold text-slate-700">Facebook</span>
        </a>

        {/* WhatsApp */}
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-green-500 hover:bg-green-50 transition group"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-green-600 group-hover:scale-110 transition" />
          <span className="text-xs font-semibold text-slate-700">WhatsApp</span>
        </a>

        {/* Twitter */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 transition group"
          title="Share on Twitter"
        >
          <svg className="w-6 h-6 text-cyan-600 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
          <span className="text-xs font-semibold text-slate-700">Twitter</span>
        </a>

        {/* Telegram */}
        <a
          href={shareLinks.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-sky-500 hover:bg-sky-50 transition group"
          title="Share on Telegram"
        >
          <svg className="w-6 h-6 text-sky-600 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.485-1.302.475-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.155.315-.499.612-.818 4.5-4.755 5.581-5.753 6.61-5.891 1.02-.133 2.362.235 3.322 1.116.957.88 1.605 2.082 1.857 3.516.25 1.402.276 2.955.023 4.5z" />
          </svg>
          <span className="text-xs font-semibold text-slate-700">Telegram</span>
        </a>

        {/* Email */}
        <a
          href={shareLinks.email}
          className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition group"
          title="Share via Email"
        >
          <Mail className="w-6 h-6 text-orange-600 group-hover:scale-110 transition" />
          <span className="text-xs font-semibold text-slate-700">Email</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition group"
          title="Copy Link"
        >
          <Copy className="w-6 h-6 text-purple-600 group-hover:scale-110 transition" />
          <span className="text-xs font-semibold text-slate-700">Copy</span>
        </button>
      </div>

      {/* Share Message Preview */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <p className="text-xs font-semibold text-slate-600 mb-2">What will be shared:</p>
        <p className="text-sm text-slate-700 line-clamp-3">
          <strong>{title}</strong>
          {'\n'}{shortDescription}
          {amount && `\n\nYour Result: ${amount}`}
          {'\n\n'}<Link2 className="w-3 h-3 inline" /> {url}
        </p>
      </div>
    </div>
  );
};
