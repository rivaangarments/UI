"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Eye, EyeOff, Gift, Lock, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import Button from "@/components/Button/Button";

const socialProviders = ["Google", "Apple", "Facebook"];
const benefits = [
  { icon: Gift, title: "Exclusive Collections", text: "Premium styles crafted for every occasion" },
  { icon: ShieldCheck, title: "Secure & Safe", text: "Your data is 100% safe and protected" },
  { icon: BadgeCheck, title: "Fast & Easy", text: "Quick sign up and seamless shopping" }
];

export default function AuthForm({ type }) {
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = type === "login";
  const isForgot = type === "forgot";
  const title = isForgot ? "Forgot Password?" : isLogin ? "Welcome Back!" : "Create Your Account";
  const subtitle = isForgot
    ? "Enter your email address and we will send you a reset link."
    : isLogin
      ? "Sign in to continue your fashion journey."
      : "Join Rivaan Garments and start your fashion journey.";

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-logo">
          <span className="logo-crop logo-light">
            <Image src="/images/icons/rivaan-logo.jpg" alt="Rivaan Garments" width={320} height={320} priority />
          </span>
        </div>
        <h1>Welcome to <strong>Rivaan Garments</strong></h1>
        <p>Create your account and explore our exclusive collection of premium quality garments.</p>
        <div className="auth-benefits">
          {benefits.map(({ icon: Icon, title: benefitTitle, text }) => (
            <div className="auth-benefit" key={benefitTitle}>
              <span><Icon size={23} /></span>
              <p><b>{benefitTitle}</b><small>{text}</small></p>
            </div>
          ))}
        </div>
      </section>
      <section className="auth-card">
        <Link href="/" className="auth-card-logo">
          <span className="logo-crop logo-light">
            <Image src="/images/icons/rivaan-logo.jpg" alt="Rivaan Garments" width={420} height={420} priority />
          </span>
        </Link>
        {!isForgot ? (
          <div className="auth-tabs">
            <Link className={isLogin ? "active" : ""} href="/login">Login</Link>
            <Link className={!isLogin ? "active" : ""} href="/register">Register</Link>
          </div>
        ) : null}
        <div className="auth-heading">
          <h2>{title} <i>✦</i></h2>
          <p>{subtitle}</p>
        </div>
        <form className="auth-form">
          {!isLogin && !isForgot ? (
            <label className="field">
              <UserRound size={18} />
              <input type="text" placeholder="Full Name" />
            </label>
          ) : null}
          <label className="field">
            <Mail size={18} />
            <input type="email" placeholder="Email Address" />
          </label>
          {!isForgot ? (
            <label className="field">
              <Lock size={18} />
              <input type={showPassword ? "text" : "password"} placeholder="Password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Show password">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </label>
          ) : null}
          {!isLogin && !isForgot ? (
            <>
              <label className="field">
                <Lock size={18} />
                <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Show password">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </label>
              <label className="terms">
                <input type="checkbox" defaultChecked /> I agree to the Terms & Conditions and Privacy Policy
              </label>
            </>
          ) : null}
          {isLogin ? <Link className="forgot-link" href="/forgot-password">Forgot Password?</Link> : null}
          <Button type="button" className="auth-submit">
            {isForgot ? "Send Reset Link" : isLogin ? "Login" : "Create Account"}
          </Button>
        </form>
        {!isForgot ? (
          <>
            <div className="auth-divider"><span>or continue with</span></div>
            <div className="social-login">
              {socialProviders.map((provider) => <button key={provider}>{provider}</button>)}
            </div>
            <p className="auth-switch">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link href={isLogin ? "/register" : "/login"}>{isLogin ? "Register" : "Login"}</Link>
            </p>
          </>
        ) : (
          <p className="auth-switch"><Link href="/login">Back to Login</Link></p>
        )}
      </section>
    </main>
  );
}
