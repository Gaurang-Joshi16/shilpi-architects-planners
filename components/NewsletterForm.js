'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="newsletter-signup-box">
      <p className="newsletter-label">
        Stay up to date with our latest projects and news
      </p>
      {submitted ? (
        <div style={{ marginTop: '24px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em', color: 'var(--ink)' }}>
          THANK YOU! WE'LL BE IN TOUCH.
        </div>
      ) : (
        <form className="input-inline-row" onSubmit={handleSubmit}>
          <input type="email" placeholder="EMAIL ADDRESS" required suppressHydrationWarning />
          <button type="submit" className="submit-btn" suppressHydrationWarning>SUBMIT</button>
        </form>
      )}
    </div>
  );
}
