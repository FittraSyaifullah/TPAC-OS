import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  login: (accessCode: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const accessCodes: Record<string, string> = {
  "123456": "Developer",
  "938271": "President",
  "472839": "Vice-President",
  "615204": "Honorary Secretary",
  "307198": "Honorary Assistant Secretary",
  "529746": "Honorary Treasurer",
  "184302": "Honorary Assistant Treasurer",
  "763910": "Training Head (General)",
  "920458": "Training Head (Land)",
  "381207": "Training Head (Water)",
  "640193": "Training Head (Welfare)",
  "859321": "Quartermaster",
  "712496": "Assistant Quartermaster",
  "530984": "Publicity Head",
  "298374": "First Assistant Publicity Head",
  "476213": "Second Assistant Publicity Head",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedRole = localStorage.getItem('userRole');
    if (storedAuth === 'true' && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = (accessCode: string): boolean => {
    const role = accessCodes[accessCode];
    if (role) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role);
      setIsAuthenticated(true);
      setUserRole(role);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};