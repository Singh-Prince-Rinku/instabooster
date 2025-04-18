"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layout/AppLayout';
import { FaSearch, FaUser, FaLock, FaEnvelope, FaInstagram } from 'react-icons/fa';

export default function ComponentsDemo() {
  const [inputValue, setInputValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [errorValue, setErrorValue] = useState("");

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">UI Components Demo</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Input Component</h2>
          
          <div className="space-y-8">
            {/* Basic Input */}
            <div>
              <h3 className="text-lg font-medium mb-3">Basic Input</h3>
              <Input 
                placeholder="Basic input" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {/* Input with Label */}
            <div>
              <h3 className="text-lg font-medium mb-3">Input with Label</h3>
              <Input 
                label="Username"
                placeholder="Enter your username" 
                className="max-w-md"
              />
            </div>
            
            {/* Input with Helper Text */}
            <div>
              <h3 className="text-lg font-medium mb-3">Input with Helper Text</h3>
              <Input 
                label="Email"
                placeholder="example@domain.com" 
                helperText="We'll never share your email with anyone else."
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {/* Input with Error */}
            <div>
              <h3 className="text-lg font-medium mb-3">Input with Error</h3>
              <Input 
                label="Password"
                type="password"
                placeholder="Enter your password" 
                error={errorValue ? "Password must be at least 8 characters" : undefined}
                value={errorValue}
                onChange={(e) => setErrorValue(e.target.value)}
                className="max-w-md"
              />
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setErrorValue("test")}
                >
                  Trigger Error
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setErrorValue("")}
                  className="ml-2"
                >
                  Clear Error
                </Button>
              </div>
            </div>
            
            {/* Input Sizes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Input Sizes</h3>
              <div className="space-y-4">
                <Input 
                  inputSize="sm"
                  placeholder="Small input" 
                  className="max-w-md"
                />
                <Input 
                  inputSize="default"
                  placeholder="Default input" 
                  className="max-w-md"
                />
                <Input 
                  inputSize="lg"
                  placeholder="Large input" 
                  className="max-w-md"
                />
              </div>
            </div>
            
            {/* Input with Icons */}
            <div>
              <h3 className="text-lg font-medium mb-3">Input with Icons</h3>
              <div className="space-y-4">
                <Input 
                  leftIcon={<FaSearch />}
                  placeholder="Search..." 
                  className="max-w-md"
                />
                <Input 
                  label="Username"
                  leftIcon={<FaUser />}
                  placeholder="Enter your username" 
                  className="max-w-md"
                />
                <Input 
                  label="Password"
                  type="password"
                  leftIcon={<FaLock />}
                  placeholder="Enter your password" 
                  className="max-w-md"
                />
                <Input 
                  label="Email"
                  leftIcon={<FaEnvelope />}
                  rightIcon={<FaInstagram className="text-blue-500" />}
                  placeholder="Your email" 
                  className="max-w-md"
                />
              </div>
            </div>
            
            {/* Input Variants */}
            <div>
              <h3 className="text-lg font-medium mb-3">Input Variants</h3>
              <div className="space-y-4">
                <Input 
                  variant="default"
                  label="Default Variant"
                  placeholder="Default input" 
                  className="max-w-md"
                />
                <Input 
                  variant="error"
                  label="Error Variant"
                  placeholder="Error input" 
                  className="max-w-md"
                />
                <Input 
                  variant="success"
                  label="Success Variant"
                  placeholder="Success input" 
                  className="max-w-md"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
} 