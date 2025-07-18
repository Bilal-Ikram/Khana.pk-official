import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Auth/auth-context';


const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    businessName: '',
    businessType: '',
    taxId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    special: false
  });

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordErrors(validations);
    return Object.values(validations).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      if (name === 'password') {
        validatePassword(value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password strength
    if (!validatePassword(formData.password)) {
      setError('Please meet all password requirements');
      return;
    }

    // Validate passwords match
    // if (formData.password !== formData.confirmPassword) {
    //   setError('Passwords do not match');
    //   return;
    // }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || 
        !formData.address.street || !formData.address.city 
        ) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
 
    console.log('Submitting registration with data:', formData);

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/seller/dashboard');
      } else {
        setError(result.error || 'Failed to register');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
      console.error('Registration error:', err);
  
        } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your seller account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
              sign in to your account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 space-y-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                  placeholder="Enter your password"
                />
                <div className="text-sm space-y-1 text-gray-600">
                  <p className={passwordErrors.length ? "text-green-600" : "text-red-600"}>
                    ✓ At least 8 characters
                  </p>
                  <p className={passwordErrors.uppercase ? "text-green-600" : "text-red-600"}>
                    ✓ At least one uppercase letter
                  </p>
                  <p className={passwordErrors.lowercase ? "text-green-600" : "text-red-600"}>
                    ✓ At least one lowercase letter
                  </p>
                  <p className={passwordErrors.special ? "text-green-600" : "text-red-600"}>
                    ✓ At least one special character
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2 mt-2">
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="address.street"
                      name="address.street"
                      type="text"
                      required
                      value={formData.address.street}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                      placeholder="Enter street address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      id="address.city"
                      name="address.city"
                      type="text"
                      required
                      value={formData.address.city}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                      placeholder="Enter city"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                    State/Province
                  </label>
                  <div className="mt-1">
                    <input
                      id="address.state"
                      name="address.state"
                      type="text"
                      
                      value={formData.address.state}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                      placeholder="Enter state or province"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
                    Zip/Postal Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="address.zipCode"
                      name="address.zipCode"
                      type="text"
                      
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                      placeholder="Enter zip or postal code"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
              
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <div className="mt-1">
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    
                    value={formData.businessName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                    placeholder="Enter your business name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                    Business Type
                  </label>
                  <div className="mt-1">
                    <input
                      id="businessType"
                      name="businessType"
                      type="text"
                      
                      value={formData.businessType}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                      placeholder="Enter your business type"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                    Tax ID (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="taxId"
                      name="taxId"
                      type="text"
                      value={formData.taxId}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-base"
                      placeholder="Enter your tax ID"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;