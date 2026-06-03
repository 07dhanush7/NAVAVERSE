import React, { useState } from 'react'
import axios from "../../api/axios";
import toast from "react-hot-toast";
const Newsletter = () => {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const { data } = await axios.post("/subscription/subscribe", { email });

      if (data.success) {
        toast.success("Thank you for subscribing!");
        setEmail("");
      }

    } catch (error) {

      console.error("Subscription Error:", error);

      toast.error(
        error.response?.data?.message || 
        "Subscription failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='newsletter'>

      <h1 className='newsletter-title'>
        Stay Ahead with NAVAVERSE
      </h1>

      <p className='newsletter-subtitle'>
        Join our community and receive the latest blogs, AI insights, tech trends, and exclusive stories directly in your inbox.
      </p>

      <p className='newsletter-desc'>
        No spam. Just powerful ideas, innovative perspectives, and curated content designed to keep you informed and inspired.
      </p>

      <form onSubmit={onSubmitHandler} className='newsletter-form'>

        <input
          className="newsletter-input"
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter your email address'
          required
        />

        <button
          type='submit'
          className='newsletter-button'
          disabled={loading}
        >
          {loading ? "Subscribing..." : "Subscribe Now"}
        </button>

      </form>

      <p className="newsletter-note">
        Join thousands of readers exploring the Universe.
      </p>

    </div>
  )
}

export default Newsletter

