import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            await login(formData.email, formData.password);
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card card">
                    <div className="card-body">
                        {/* Logo and Branding */}
                        <div className="text-center mb-4">
                            <div className="logo">
                                <h1
                                    style={{
                                        background:
                                            "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        fontSize: "2.5rem",
                                        fontWeight: "700",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    ChicCheckout
                                </h1>
                            </div>
                            <p
                                style={{
                                    color: "#666",
                                    fontSize: "1.1rem",
                                    margin: 0,
                                }}
                            >
                                Beauty POS System
                            </p>
                            <p
                                style={{
                                    color: "#999",
                                    fontSize: "0.875rem",
                                    marginTop: "0.5rem",
                                }}
                            >
                                Admin Portal - Secure Access Required
                            </p>
                        </div>

                        {/* Security Notice */}
                        <div className="alert alert-info mb-4">
                            <strong>Security Notice:</strong> This is a secure
                            admin portal. Please protect your login credentials
                            and never share them with unauthorized personnel.
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">
                                    <Mail
                                        size={16}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${
                                        errors.email ? "error" : ""
                                    }`}
                                    placeholder="Enter your email address"
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <div className="form-error">
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Lock
                                        size={16}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    Password
                                </label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`form-input ${
                                            errors.password ? "error" : ""
                                        }`}
                                        placeholder="Enter your password"
                                        disabled={loading}
                                        style={{ paddingRight: "3rem" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        style={{
                                            position: "absolute",
                                            right: "0.75rem",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#666",
                                            padding: "0.25rem",
                                        }}
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="form-error">
                                        {errors.password}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: "100%" }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign In to Admin Portal"
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="text-center mt-4">
                            <p style={{ fontSize: "0.75rem", color: "#999" }}>
                                © 2025 ChicCheckout. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="beauty" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23beauty)"/></svg>');
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
        }

        .login-card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideUp 0.6s ease;
        }

        .logo {
          position: relative;
        }

        .logo::after {
          content: '✨';
          position: absolute;
          top: -10px;
          right: -10px;
          font-size: 1.5rem;
          animation: pulse 2s infinite;
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 1rem;
          }

          .login-container {
            max-width: 100%;
          }
        }
      `}</style>
        </div>
    );
};

export default LoginPage;
