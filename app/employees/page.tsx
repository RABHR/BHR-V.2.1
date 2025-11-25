"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/adminApi';
import { useRouter } from 'next/navigation';
import { Users, LogOut } from 'lucide-react';

export default function EmployeesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await adminApi.employeeCheckAuth();
      if (response.logged_in) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminApi.employeeLogout();
      setIsAuthenticated(false);
      router.push('/employees');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {!isAuthenticated ? (
            <Card className="w-full">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  BrainHR Staff Portal
                </CardTitle>
                <CardDescription className="text-center">
                  Access your employee dashboard to manage timesheets, visa documents, and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <p className="text-gray-600 text-center">
                    Welcome to the BrainHR Staff Portal. Please log in with your credentials to access your dashboard.
                  </p>
                  <div className="grid gap-4">
                    <Link href="/employees/login" className="block">
                      <Button size="lg" className="w-full">
                        Access Employee Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Available Features:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✓ Submit and manage timesheets for weeks, months, or years</li>
                    <li>✓ Upload and organize visa and other documents</li>
                    <li>✓ Post and track activities</li>
                    <li>✓ View notifications and communicate with management</li>
                    <li>✓ Access your employee profile and documents anytime</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Welcome to Employee Dashboard</CardTitle>
                  <CardDescription>You are logged in. Click below to access your dashboard.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </CardHeader>
              <CardContent>
                <Link href="/employees/dashboard" className="block">
                  <Button size="lg" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
