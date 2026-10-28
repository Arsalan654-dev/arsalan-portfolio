'use client';

import { useState } from 'react';
import publicService from '@/services/publicService';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser, faHeading, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await publicService.submitContact(form);
      if (data.success) {
        toast.success('Message sent successfully!');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ background: 'var(--bs)', minHeight: '80vh' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ background: 'var(--gm)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Get In Touch
          </h1>
          <p className="mb-0" style={{ color: 'var(--ts)' }}>Have a project in mind? Let&apos;s talk about it.</p>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            <div className="card border-0 rounded-3 p-4" style={{ background: 'var(--bc)' }}>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                    <FontAwesomeIcon icon={faUser} className="me-2" style={{ color: 'var(--ap)' }} />Name
                  </label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    className="form-control" placeholder="Your name"
                    style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" style={{ color: 'var(--ap)' }} />Email
                  </label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    className="form-control" placeholder="your@email.com"
                    style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                    <FontAwesomeIcon icon={faHeading} className="me-2" style={{ color: 'var(--ap)' }} />Subject
                  </label>
                  <input
                    type="text" name="subject" value={form.subject} onChange={handleChange}
                    className="form-control" placeholder="Subject"
                    style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)' }}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" style={{ color: 'var(--ap)' }} />Message
                  </label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    className="form-control" rows="5" placeholder="Your message..."
                    style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)', resize: 'vertical' }}
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="btn w-100 fw-semibold py-2 border-0"
                  style={{ background: 'var(--bt)', color: '#fff' }}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                  ) : (
                    <><FontAwesomeIcon icon={faPaperPlane} className="me-2" />Send Message</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
