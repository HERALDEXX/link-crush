"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import AuthBlock from "@/components/AuthBlock";
import URLShortenerForm from "@/components/URLShortenerForm";
import StatisticsTable from "@/components/StatisticsTable";
import Toast from "@/components/Toast";

export default function Home() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  const handleUrlShortened = () => {
    setStatsRefreshKey((current) => current + 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Loading spinner */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white/80 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Background */}
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-16 pt-8">
            <div className="inline-block relative mb-6">
              <h1 className="text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent mb-4 leading-tight">
                LinkCrush
              </h1>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 blur-xl rounded-lg"></div>
            </div>
            <p className="text-xl text-white/80 font-medium mb-2 max-w-2xl mx-auto leading-relaxed">
              Transform endless URLs into powerful, trackable links
            </p>
            <p className="text-white/60 max-w-lg mx-auto">
              Professional URL shortening with real-time analytics and
              lightning-fast redirects
            </p>
          </header>

          {/* Auth Block */}
          <div className="mb-12">
            <AuthBlock
              user={user}
              onLogin={login}
              onLogout={logout}
              showToast={showToast}
            />
          </div>

          {/* Main Form */}
          <div className="mb-16">
            <URLShortenerForm
              showToast={showToast}
              onShortened={handleUrlShortened}
            />
          </div>

          {/* Statistics */}
          <StatisticsTable
            user={user}
            showToast={showToast}
            refreshTrigger={statsRefreshKey}
          />
        </div>
      </div>

      {/* Toast Messages */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
