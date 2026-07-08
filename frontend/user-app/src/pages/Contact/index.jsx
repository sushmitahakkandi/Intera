import React, { useState } from 'react';
import { Card, Button, Input, Textarea } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.msg) {
      toast.error('All fields are required');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Your message has been sent successfully!');
      setForm({ name: '', email: '', msg: '' });
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Get in Touch</h1>
        <p className="text-sm text-gray-400 font-medium max-w-md mx-auto">
          We are always here to help you select, customize, or track your premium furniture order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Contact Info Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="p-6 bg-white flex flex-col justify-between flex-grow">
            <div>
              <h3 className="font-bold text-gray-800 text-base mb-4 border-b border-gray-100 pb-3">
                Corporate Showroom
              </h3>
              
              <div className="flex flex-col gap-6 text-sm text-gray-650 font-medium mt-4">
                <a
                  href="https://maps.google.com/?q=Davangere,Karnataka,India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 hover:text-primary transition-colors"
                >
                  <FiMapPin className="text-primary mt-1 flex-shrink-0" size={18} />
                  <div>
                    <span className="block font-bold text-gray-800 text-xs uppercase tracking-wider mb-0.5">Address</span>
                    <span>Davangere Main Road, Davangere, Karnataka, India - 577004</span>
                  </div>
                </a>

                <a
                  href="tel:+919741212888"
                  className="flex items-start gap-3 hover:text-primary transition-colors"
                >
                  <FiPhone className="text-primary mt-1 flex-shrink-0" size={18} />
                  <div>
                    <span className="block font-bold text-gray-800 text-xs uppercase tracking-wider mb-0.5">Phone</span>
                    <span>+91 9741212888</span>
                  </div>
                </a>

                <a
                  href="mailto:support@mahaveer.com"
                  className="flex items-start gap-3 hover:text-primary transition-colors"
                >
                  <FiMail className="text-primary mt-1 flex-shrink-0" size={18} />
                  <div>
                    <span className="block font-bold text-gray-800 text-xs uppercase tracking-wider mb-0.5">Email</span>
                    <span>support@mahaveer.com</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mt-8 flex items-start gap-3 text-sm text-gray-650 font-medium">
              <FiClock className="text-primary mt-0.5 flex-shrink-0" size={18} />
              <div>
                <span className="block font-bold text-gray-800 text-xs uppercase tracking-wider mb-0.5">Business Hours</span>
                <p>Monday - Saturday: 10:00 AM - 08:00 PM</p>
                <p className="text-xs text-gray-400 mt-1">Sunday: Appointment Only</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 flex flex-col">
          <Card className="p-6 bg-white flex-grow">
            <h3 className="font-bold text-gray-800 text-base mb-4 border-b border-gray-100 pb-3">
              Send a Quick Message
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="name@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Textarea
                label="Message Details"
                placeholder="Enter details about your furniture customization or shipping query..."
                value={form.msg}
                onChange={(e) => setForm({ ...form, msg: e.target.value })}
                required
              />
              <Button type="submit" loading={isSubmitting} className="w-fit self-end mt-4">
                Submit Inquiry
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}