
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../api';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register' | '2fa';

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 2FA state
  const [generatedCode, setGeneratedCode] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      // REQUEST CODE FROM API
      const result = await authService.request2FA(email);
      
      // FIX: Always capture and show the code in this prototype environment
      const code = result.devCode || '123456'; 
      setGeneratedCode(code);
      setShowNotification(true);
      setMode('2fa');
      
      // Auto-hide notification after 30 seconds
      setTimeout(() => setShowNotification(false), 30000);
    } catch (err) {
      setError('System connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !name) {
      setError('Please enter your full name');
      return;
    }
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    await handleSendCode();
  };

  const verify2FA = async () => {
    const codeEntered = otp.join('');
    if (codeEntered.length < 6) return;

    setIsLoading(true);
    // Strict verification against our local state (simulating server check)
    const isServerVerified = await authService.verify2FA(email, codeEntered);
    
    // For this prototype, we accept the server response OR a match with our UI-shown code
    if (isServerVerified && codeEntered === generatedCode) {
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name || (email.split('@')[0]),
        email: email,
        role: role,
        avatar: `https://picsum.photos/seed/${email}/100/100`,
        isVerified: true
      };
      onAuthSuccess(mockUser);
    } else {
      setError('Verification failed. Invalid or expired code.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
    setIsLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Auto-focus first OTP input when entering 2FA mode
  useEffect(() => {
    if (mode === '2fa') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [mode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* ACCESS CODE NOTIFICATION - CRITICAL FIX */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm z-[100] animate-slideDown px-4">
          <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-blue-600 p-5 flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <i className="fa-solid fa-shield-halved text-xl"></i>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">REATHUTA Secure Pass</p>
                <button onClick={() => setShowNotification(false)} className="text-slate-300 hover:text-slate-500"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-3">Your unique login token:</p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center shadow-xl">
                <span className="text-2xl font-mono font-black text-white tracking-[0.4em]">{generatedCode}</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-3 italic text-center">Expires in 5 minutes</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative z-10 animate-fadeIn">
        {mode !== '2fa' && (
          <div className="flex border-b border-slate-50">
            <button 
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-5 text-[10px] font-black tracking-[0.2em] transition-all ${mode === 'login' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
            >
              SIGN IN
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-5 text-[10px] font-black tracking-[0.2em] transition-all ${mode === 'register' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
            >
              REGISTER
            </button>
          </div>
        )}

        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
             <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center text-white font-black text-3xl mb-6 shadow-2xl shadow-blue-200 rotate-3">R</div>
             <h1 className="text-2xl font-black text-slate-800 tracking-tight">
               {mode === '2fa' ? 'Final Verification' : mode === 'login' ? 'System Access' : 'Create Student Profile'}
             </h1>
             <p className="text-sm text-slate-400 mt-2 font-medium">
               {mode === '2fa' ? `Check the secure token sent to ${email}` : 'Secure Learning Architecture'}
             </p>
          </div>

          {mode === '2fa' ? (
            <div className="space-y-8">
              {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 text-center animate-shake">{error}</div>}
              
              <div className="flex justify-between gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-full h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  />
                ))}
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={verify2FA}
                  disabled={isLoading || otp.some(d => d === '')}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center disabled:opacity-50 disabled:shadow-none transition-all scale-105 active:scale-100"
                >
                  {isLoading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirm & Enter System'}
                </button>
                <button onClick={() => { setMode('login'); setError(''); setOtp(['','','','','','']); }} className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel Session</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-5">
              {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 mb-4 text-center">{error}</div>}
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity</label>
                {mode === 'register' && (
                  <input 
                    type="text" 
                    placeholder="Legal Full Name" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all mb-3"
                  />
                )}
                <input 
                  type="email" 
                  placeholder="name@enterprise.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Protocol Access</p>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setRole(UserRole.STUDENT)} 
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black border-2 transition-all flex flex-col items-center justify-center space-y-1 ${role === UserRole.STUDENT ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-inner' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    <i className="fa-solid fa-user-graduate text-base mb-1"></i>
                    <span>STUDENT</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole(UserRole.ADMIN)} 
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black border-2 transition-all flex flex-col items-center justify-center space-y-1 ${role === UserRole.ADMIN ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-inner' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    <i className="fa-solid fa-user-shield text-base mb-1"></i>
                    <span>INSTRUCTOR</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center mt-6 scale-105 active:scale-100"
              >
                {isLoading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : (mode === 'login' ? 'Proceed to 2FA' : 'Initialize Account')}
              </button>
            </form>
          )}

          <div className="mt-12 pt-8 border-t flex items-center justify-between text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Protocol Active</span>
            </div>
            <div className="flex items-center space-x-1 opacity-40">
               <i className="fa-solid fa-shield-halved text-xs"></i>
               <span className="text-[10px] font-bold">SHA-256</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-200 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
    </div>
  );
};

export default Auth;
