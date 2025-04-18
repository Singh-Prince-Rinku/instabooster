'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';

export default function InputExamplePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      alert('Form submitted successfully!');
      // Would typically make an API call here
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-6">Input Component Examples</h1>
          
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  name="name"
                  type="text"
                  label="Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />
                
                <Input
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="john@example.com"
                  helperText="We'll never share your email with anyone else."
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                
                <Input
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="********"
                  helperText="Password must be at least 6 characters."
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />
              </div>
              
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
            
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Input Variations</h2>
              
              <div className="space-y-4">
                <Input 
                  placeholder="Disabled input" 
                  disabled 
                />
                
                <Input 
                  placeholder="Input with error" 
                  error="This is an error message"
                />
                
                <div className="relative">
                  <Input 
                    placeholder="Input with icon"
                    className="pl-10" 
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
} 