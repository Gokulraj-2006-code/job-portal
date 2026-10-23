import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactService } from '../services/contactService';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await contactService.submitMessage(formData);
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-contact container-custom py-16">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-slate-600 max-w-2xl dark:text-slate-300 mb-12">
        Have questions about JobPortal? We&apos;d love to hear from you. 
        Fill out the form below and we&apos;ll get back to you within 24 hours.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="label-text">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label-text">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input-field"
                placeholder="How can we help?"
                required
              />
            </div>
            <div>
              <label className="label-text">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="input-field min-h-[120px]"
                placeholder="Your message here..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {sending ? 'Sending...' : (
                <>
                  Send Message <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Get in touch</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">support@jobportal.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Office</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    123 Tech Park, Suite 100<br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 rounded-xl p-6 dark:bg-primary-900/30">
            <h3 className="font-semibold text-primary-900 dark:text-primary-200 mb-2">Support Hours</h3>
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Monday - Friday: 9:00 AM - 6:00 PM (EST)<br />
              Saturday - Sunday: Closed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;