import { useState } from 'react';
import { HelpCircle, FileText, MessageCircle } from 'lucide-react';

type HelpSection = 'privacy' | 'faq';

export default function HelpTab() {
  const [activeSection, setActiveSection] = useState<HelpSection>('faq');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Help & Support</h2>
        <p className="text-gray-600 mt-1">Get help and learn more about INVO Maker</p>
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSection('faq')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeSection === 'faq'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <MessageCircle className="w-5 h-5 inline mr-2" />
            FAQs
          </button>
          <button
            onClick={() => setActiveSection('privacy')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeSection === 'privacy'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Privacy Policy
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        {activeSection === 'faq' && <FAQs />}
        {activeSection === 'privacy' && <PrivacyPolicy />}
      </div>
    </div>
  );
}

function FAQs() {
  const faqs = [
    {
      question: 'How do I create my first invoice?',
      answer: 'Navigate to the Invoices page and click "New Invoice". Fill in the customer details, add products or services, and set payment terms. You can save as draft or send immediately.',
    },
    {
      question: 'Can I customize invoice templates?',
      answer: 'Yes! Go to Settings and customize your business information, logo, invoice prefix, default payment terms, and more. These settings will be applied to all your invoices.',
    },
    {
      question: 'How does AI invoice creation work?',
      answer: 'Use the AI Quick Invoice feature on the Dashboard. Simply describe your invoice in natural language (e.g., "Invoice John for 3 AC cleanings at $80 each"), and AI will create a structured invoice for you.',
    },
    {
      question: 'What payment methods are supported?',
      answer: 'You can record payments manually in the invoice detail page. Supported payment methods include Cash, Credit Card, Bank Transfer, Check, and Other. Payment tracking helps you monitor outstanding balances.',
    },
    {
      question: 'How do I track customer payments?',
      answer: 'Each invoice shows the total amount, paid amount, and balance. You can add multiple payments to an invoice, and the system automatically calculates the remaining balance.',
    },
    {
      question: 'Can I scan barcodes for products?',
      answer: 'Yes! When creating or editing a product, you can use the camera icon to scan a barcode. The barcode will be automatically added to the product for quick lookup when creating invoices.',
    },
    {
      question: 'How do I send invoices to customers?',
      answer: 'On the invoice detail page, you can download a PDF, send via email (with AI-generated content), or send via SMS. The email includes all invoice details and can be customized with AI assistance.',
    },
    {
      question: 'What are the subscription plan limits?',
      answer: 'Free plan: 10 invoices, 10 AI summaries, 10 AI invoice creations per month. Pro plan ($4.99/month): Unlimited invoices, 50 AI summaries, 50 AI invoice creations. Gold plan ($11.99/month): Unlimited everything.',
    },
    {
      question: 'How do I manage inventory?',
      answer: 'Products have a stock quantity field. When you create an invoice with products, you can choose to decrease stock automatically. Low stock alerts will notify you when products are running low.',
    },
    {
      question: 'Can I export my data?',
      answer: 'Currently, you can download invoices as PDFs. Data export features are coming soon. All your data is stored securely in Supabase and can be accessed through the app.',
    },
    {
      question: 'How do I set up my business profile?',
      answer: 'Go to Settings → Settings tab and fill in your business information including name, address, contact details, logo, and invoice preferences. This information will appear on all your invoices.',
    },
    {
      question: 'What happens if I exceed my plan limits?',
      answer: 'You\'ll receive a notification when approaching your limits. To continue using features, you can upgrade your plan from the Subscription tab in Settings.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-6 h-6 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
            <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
        <section>
          <h4 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h4>
          <p className="text-sm leading-relaxed">
            INVO Maker collects information necessary to provide our invoicing services. This includes:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Account information (email, password)</li>
            <li>Business information (name, address, contact details)</li>
            <li>Customer data (names, addresses, contact information)</li>
            <li>Invoice and payment records</li>
            <li>Product and inventory information</li>
            <li>Usage statistics for subscription management</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h4>
          <p className="text-sm leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Provide and maintain our invoicing services</li>
            <li>Process transactions and manage subscriptions</li>
            <li>Send invoices and communications to your customers</li>
            <li>Generate reports and analytics</li>
            <li>Improve our services and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 mb-2">3. Data Storage and Security</h4>
          <p className="text-sm leading-relaxed">
            Your data is stored securely using Supabase, a trusted cloud database platform. We implement:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Encryption in transit and at rest</li>
            <li>Row-level security policies</li>
            <li>Regular security audits</li>
            <li>Secure authentication mechanisms</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 mb-2">4. AI Features and Data Processing</h4>
          <p className="text-sm leading-relaxed">
            When you use AI features (invoice creation, summaries, translations), your data may be processed by OpenAI's services. We:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Only send necessary data for AI processing</li>
            <li>Do not use your data to train AI models</li>
            <li>Follow OpenAI's privacy and data usage policies</li>
            <li>Allow you to opt-out of AI features</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 mb-2">5. Third-Party Services</h4>
          <p className="text-sm leading-relaxed">
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>Supabase:</strong> Database and authentication services</li>
            <li><strong>OpenAI:</strong> AI-powered features (invoice creation, summaries, translations)</li>
            <li><strong>RevenueCat:</strong> Subscription management (if configured)</li>
          </ul>
          <p className="text-sm leading-relaxed mt-2">
            These services have their own privacy policies, and we recommend reviewing them.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 mb-2">6. Your Rights</h4>
          <p className="text-sm leading-relaxed">
            You have the right to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt-out of certain data processing</li>
          </ul>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 mb-2">7. Data Retention</h4>
          <p className="text-sm leading-relaxed">
            We retain your data for as long as your account is active or as needed to provide services. 
            If you delete your account, we will delete your data within 30 days, except where we are 
            required to retain it for legal purposes.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 mb-2">8. Children's Privacy</h4>
          <p className="text-sm leading-relaxed">
            INVO Maker is not intended for users under the age of 18. We do not knowingly collect 
            personal information from children.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 mb-2">9. Changes to This Policy</h4>
          <p className="text-sm leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 mb-2">10. Contact Us</h4>
          <p className="text-sm leading-relaxed">
            If you have questions about this Privacy Policy, please contact us through the app's 
            support channels or your account settings.
          </p>
        </section>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}

