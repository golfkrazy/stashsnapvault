import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";
import { GoogleOAuthButton, AuthFeedback } from "../../components";
import { BrandHeader, BrandFooter } from "../../components/BrandComponents";

const SignUpPage = () => {
  // ==============================
  // If user is already logged in, redirect to home
  // This logic is being repeated in SignIn and SignUp..
  const { session } = useSession();
  if (session) return <Navigate to="/" />;
  // maybe we can create a wrapper component for these pages
  // just like the ./router/AuthProtectedRoute.tsx? up to you.
  // ==============================
  const [status, setStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Creating account...");
    const { error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("✅ Account created! Check your email to verify your account.");
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BrandHeader />
      <form className="main-container" onSubmit={handleSubmit} style={{ flex: 1, margin: '2rem auto' }}>
        <h1 className="header-text">Sign Up</h1>
        <p
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            color: "#777",
          }}
        >
          Demo app, please don't use your real email or password
        </p>
        <GoogleOAuthButton />
        <div className="auth-divider">
          <span>OR</span>
        </div>
        <input
          name="email"
          onChange={handleInputChange}
          type="email"
          placeholder="Email"
        />
        <div className="password-container">
          <input
            name="password"
            onChange={handleInputChange}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        <button type="submit">Create Account</button>
        <Link className="auth-link" to="/auth/sign-in">
          Already have an account? Sign In
        </Link>
        {/* Branded Status/Error Feedback */}
        <AuthFeedback
          type={status.includes('✅') ? 'success' : (status.includes('Creating') ? 'info' : 'error')}
          message={status}
          onClear={() => setStatus('')}
        />
      </form>
      <BrandFooter />
    </main>
  );
};

export default SignUpPage;
