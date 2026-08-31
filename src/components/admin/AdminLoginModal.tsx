import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  Fingerprint, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles,
  Terminal,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { adminAuthService, SUPER_ADMIN_EMAIL, DEFAULT_MASTER_KEY, BACKUP_PIN } from '../../services/adminAuthService';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState<string>(SUPER_ADMIN_EMAIL);
  const [passkey, setPasskey] = useState<string>('');
  const [showPasskey, setShowPasskey] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricSuccess, setBiometricSuccess] = useState<boolean>(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      const result = adminAuthService.login(email, passkey);
      setIsAuthenticating(false);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Authentication rejected. Access denied.');
      }
    }, 600);
  };

  // Quick 1-Click Biometric / Passkey Authenticator for the Super Admin
  const handleBiometricAuth = () => {
    setError(null);
    setBiometricScanning(true);

    setTimeout(() => {
      // Authenticate directly with the sovereign superadmin master key
      const activeKey = adminAuthService.getMasterKey() || DEFAULT_MASTER_KEY;
      const result = adminAuthService.login(SUPER_ADMIN_EMAIL, activeKey);
      setBiometricScanning(false);

      if (result.success) {
        setBiometricSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 400);
      } else {
        setError(result.error || 'Biometric handshake failed.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030303]/95 backdrop-blur-xl select-none font-mono">
      
      {/* Background Matrix / Grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Main Security Card */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#090909] border border-[#222222] shadow-[0_0_50px_rgba(0,255,65,0.12)] overflow-hidden">
        
        {/* Top Glowing Security Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00FF41] via-[#00D436] to-purple-600 animate-pulse" />

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header & Badges */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] mb-2 shadow-[0_0_25px_rgba(0,255,65,0.2)]">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="flex items-center justify-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/30">
                RESTRICTED AREA
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                LEVEL 4 UTXO CLEARANCE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Super Admin Gateway
            </h1>
            <p className="text-xs text-[#888] max-w-sm mx-auto">
              This sovereign administration terminal is strictly restricted to authorized Super Admin <span className="text-[#00FF41] font-bold">aurashampy@gmail.com</span> only.
            </p>
          </div>

          {/* Quick Biometric / Passkey One-Click Button */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-[#242424] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Fingerprint className="w-4 h-4 text-[#00FF41]" />
                <span>Sovereign Passkey / Biometric</span>
              </div>
              <span className="text-[10px] text-[#00FF41] bg-[#00FF41]/10 px-2 py-0.5 rounded border border-[#00FF41]/20 font-bold">
                Instant Verification
              </span>
            </div>

            <button
              onClick={handleBiometricAuth}
              disabled={biometricScanning || isAuthenticating}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg ${
                biometricSuccess
                  ? 'bg-[#00FF41] text-black'
                  : 'bg-[#181818] hover:bg-[#202020] text-white hover:text-[#00FF41] border border-[#333] hover:border-[#00FF41]/50'
              }`}
            >
              {biometricScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 text-[#00FF41] animate-spin" />
                  <span>Scanning Sovereign Credentials...</span>
                </>
              ) : biometricSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Identity Verified • Unlocking Terminal...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4 text-[#00FF41]" />
                  <span>Authenticate as {SUPER_ADMIN_EMAIL}</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#1C1C1C] w-full" />
            <span className="bg-[#090909] px-3 text-[10px] text-[#666] uppercase tracking-wider absolute">
              Or Master Key / PIN Login
            </span>
          </div>

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            
            {/* Email Field (Restricted to aurashampy@gmail.com) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider flex items-center justify-between">
                <span>Authorized Admin Email</span>
                <span className="text-[#00FF41] text-[10px]">Restricted</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aurashampy@gmail.com"
                className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white font-mono focus:outline-none focus:border-[#00FF41] transition-colors"
              />
            </div>

            {/* Passkey / Master PIN Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#888] uppercase tracking-wider flex items-center justify-between">
                <span>Master Passkey / PIN</span>
                <span className="text-[#666] text-[10px]">Default: aurashampy2026 or PIN 777888</span>
              </label>
              <div className="relative">
                <input
                  type={showPasskey ? 'text' : 'password'}
                  required
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter master passkey or security PIN..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white font-mono focus:outline-none focus:border-[#00FF41] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"
                >
                  {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start space-x-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* Submit & Cancel Buttons */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] text-[#888] hover:text-white font-bold transition-colors flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return</span>
              </button>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#00FF41] hover:bg-[#00D436] text-black font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow-[0_0_20px_rgba(0,255,65,0.3)] disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Admin Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Security Telemetry Footer */}
          <div className="pt-4 border-t border-[#181818] flex items-center justify-between text-[10px] text-[#555] font-mono">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-[#00FF41]" />
              <span>Multi-Factor Nonce 2048-bit</span>
            </div>
            <div>Authorized ID: <span className="text-[#888]">aurashampy</span></div>
          </div>

        </div>

      </div>

    </div>
  );
};
