import React, { useState } from "react";
import { Link } from "react-router-dom"; // Use if you are using React Router

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({}); // Store field-specific errors

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null })); // Clear error for the field being edited
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Signup successful:", result);
      } else {
        console.error("Signup error:", result.errors);
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Create an Account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <input
      type="text"
      name="username"
      placeholder="Full Name"
      value={formData.username}
      onChange={handleChange}
      required
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      autoComplete="name"
    />
    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
  </div>
  <div>
    <input
      type="email"
      name="email"
      placeholder="Email Address"
      value={formData.email}
      onChange={handleChange}
      required
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      autoComplete="email"
    />
    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
  </div>
  <div>
    <input
      type="password"
      name="password"
      placeholder="Password"
      value={formData.password}
      onChange={handleChange}
      required
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      autoComplete="new-password"
    />
    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
  </div>
  <button
    type="submit"
    className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
  >
    Sign Up
  </button>
</form>

      <p className="text-center mt-4 text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-500 font-medium hover:underline"
        >
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignUp;

