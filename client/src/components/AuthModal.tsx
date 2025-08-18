import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, AgeGroup } from "@/types/user";

interface AuthModalProps {
  isOpen: boolean;
  mode: 'signin' | 'signup';
  initialRole?: string;
  initialAgeGroup?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function AuthModal({ isOpen, mode: initialMode, initialRole, initialAgeGroup, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: initialRole || '',
    ageGroup: initialAgeGroup || '6-11',
    childName: '',
    schoolName: ''
  });
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password);
        onSuccess('Successfully signed in!');
      } else {
        await signUp(
          formData.email, 
          formData.password, 
          formData.name, 
          formData.role as UserRole,
          formData.role === 'student' ? formData.ageGroup as AgeGroup : undefined,
          formData.role === 'parent' ? formData.childName : undefined,
          formData.role === 'school_admin' ? formData.schoolName : undefined
        );
        onSuccess('Successfully signed up!');
      }
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: initialRole || '',
      ageGroup: initialAgeGroup || '6-11',
      childName: '',
      schoolName: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            data-testid="button-close-auth"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select 
                  required 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="select-role"
                >
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="school_admin">School Administrator</option>
                </select>
              </div>

              {formData.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                  <select 
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({...formData, ageGroup: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid="select-age-group"
                  >
                    <option value="6-11">Little Coders (6-11 years)</option>
                    <option value="12-17">Teen Coders (12-17 years)</option>
                  </select>
                </div>
              )}

              {formData.role === 'parent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Child's Name</label>
                  <input 
                    type="text" 
                    value={formData.childName}
                    onChange={(e) => setFormData({...formData, childName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Enter your child's name"
                    data-testid="input-child-name"
                  />
                </div>
              )}

              {formData.role === 'school_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                  <input 
                    type="text" 
                    value={formData.schoolName}
                    onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Enter your school's name"
                    data-testid="input-school-name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="input-name"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="input-email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="input-password"
            />
          </div>

          <button 
            type="submit" 
            className={`w-full py-3 rounded-lg font-semibold transition ${
              mode === 'signin' 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            data-testid={mode === 'signin' ? 'button-signin' : 'button-signup'}
          >
            {mode === 'signin' ? 'Sign In' : 'Sign Up Free'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={async () => {
              try {
                await signInWithGoogle();
                onSuccess('Successfully signed in with Google!');
                onClose();
              } catch (error) {
                console.error('Google sign in error:', error);
              }
            }}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50 transition"
            data-testid="button-google-signin"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google</span>
          </button>

          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-blue-500 hover:text-blue-600"
              data-testid="button-switch-mode"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}