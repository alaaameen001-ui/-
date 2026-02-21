import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Phone, 
  GraduationCap, 
  Search, 
  Settings, 
  Users, 
  BookOpen, 
  BarChart3, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert,
  ExternalLink,
  MessageCircle,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type View = 'login' | 'register' | 'subscription_success' | 'admin_login' | 'admin_dashboard' | 'student_dashboard';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  grade: string;
  status: 'pending' | 'allowed' | 'locked' | 'blocked';
  subscription_days: number;
  password?: string;
}

// --- Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-3xl shadow-xl p-8 border border-neutral-100 ${className}`}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<Student | null>(null);
  const [adminAuth, setAdminAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGrade, setRegGrade] = useState('');
  const [regPass, setRegPass] = useState('');

  const [adminPassInput, setAdminPassInput] = useState('');

  // Admin Dashboard States
  const [members, setMembers] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Student | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [newAdminPass, setNewAdminPass] = useState('');
  const [adminView, setAdminView] = useState<'lessons' | 'members' | 'settings' | 'stats'>('members');
  const [manualDays, setManualDays] = useState<number>(0);

  useEffect(() => {
    if (selectedMember) {
      setManualDays(selectedMember.subscription_days);
    }
  }, [selectedMember]);

  useEffect(() => {
    if (adminAuth) {
      fetchMembers();
      fetchStats();
    }
  }, [adminAuth]);

  const fetchMembers = async () => {
    const res = await fetch('/api/admin/members');
    const data = await res.json();
    setMembers(data);
  };

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    setStats(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setView('student_dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: regName, 
          email: regEmail, 
          password: regPass, 
          phone: regPhone, 
          grade: regGrade 
        })
      });
      const data = await res.json();
      if (data.success) {
        setView('subscription_success');
      } else {
        setError(data.message || 'حدث خطأ أثناء التسجيل');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassInput })
      });
      const data = await res.json();
      if (data.success) {
        setAdminAuth(true);
        setView('admin_dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const updateMemberStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/members/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchMembers();
    if (selectedMember?.id === id) {
      setSelectedMember({ ...selectedMember, status: status as any });
    }
  };

  const updateSubscription = async (id: number, days: number) => {
    await fetch(`/api/admin/members/${id}/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days })
    });
    fetchMembers();
  };

  const changeAdminPass = async () => {
    await fetch('/api/admin/settings/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: newAdminPass })
    });
    alert('تم تغيير الرقم السري بنجاح');
    setNewAdminPass('');
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
    if (url.includes('linkthread')) {
      fetch('/api/stats/lesson-watch', { method: 'POST' });
    }
  };

  // --- Renderers ---

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-teal-100">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">منصة التعليم الذكي</h1>
          <p className="text-neutral-500">مرحباً بك مجدداً، سجل دخولك للمتابعة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                type="email" 
                required
                className="input-field pr-10" 
                placeholder="example@mail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">الرقم السري</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                type="password" 
                required
                className="input-field pr-10" 
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-emerald-600"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm text-neutral-600">تذكرني</span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-neutral-600">
            طالب جديد؟{' '}
            <button onClick={() => setView('register')} className="text-emerald-600 font-bold hover:underline">
              سجل الآن
            </button>
          </p>
          <div className="pt-4 border-t border-neutral-100">
            <button 
              onClick={() => setView('admin_login')}
              className="text-neutral-400 text-sm hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <ShieldAlert className="w-4 h-4" />
              دخول الإدارة
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderRegister = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-teal-100">
      <Card className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setView('login')} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-emerald-800">تسجيل طالب جديد</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">الاسم الكامل</label>
            <input 
              type="text" 
              required
              className="input-field" 
              placeholder="أدخل اسمك الثلاثي"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              className="input-field" 
              placeholder="example@mail.com"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                type="tel" 
                required
                className="input-field pr-10" 
                placeholder="07XXXXXXXXX"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">المرحلة الدراسية</label>
            <div className="relative">
              <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <select 
                required
                className="input-field pr-10 appearance-none"
                value={regGrade}
                onChange={(e) => setRegGrade(e.target.value)}
              >
                <option value="">اختر المرحلة</option>
                <option value="الأول متوسط">الأول متوسط</option>
                <option value="الثاني متوسط">الثاني متوسط</option>
                <option value="الثالث متوسط">الثالث متوسط</option>
                <option value="الرابع إعدادي">الرابع إعدادي</option>
                <option value="الخامس إعدادي">الخامس إعدادي</option>
                <option value="السادس إعدادي">السادس إعدادي</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">الرقم السري</label>
            <input 
              type="password" 
              required
              className="input-field" 
              placeholder="••••••••"
              value={regPass}
              onChange={(e) => setRegPass(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'جاري الإرسال...' : 'اشترك الآن'}
          </button>
        </form>
      </Card>
    </div>
  );

  const renderSubscriptionSuccess = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-teal-100">
      <Card className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-emerald-800 mb-4">أهلاً بك في منصتنا!</h2>
        <p className="text-neutral-600 mb-8">
          تم استلام طلب اشتراكك بنجاح. يرجى التواصل مع الإدارة لتفعيل حسابك والبدء في رحلتك التعليمية.
        </p>

        <div className="space-y-4">
          <a 
            href="tel:07822285097" 
            className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <PhoneCall className="w-5 h-5" />
            اتصال مباشر: 07822285097
          </a>
          <a 
            href="https://t.me/iqme2026" 
            target="_blank"
            className="flex items-center justify-center gap-3 w-full py-4 bg-sky-500 text-white rounded-2xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-200"
          >
            <MessageCircle className="w-5 h-5" />
            تلغرام: @iqme2026
          </a>
          <button 
            onClick={() => setView('login')}
            className="w-full py-3 text-neutral-500 font-medium hover:text-emerald-600 transition-colors"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </Card>
    </div>
  );

  const renderAdminLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-900">
      <Card className="w-full max-w-md bg-neutral-800 border-neutral-700 text-white">
        <div className="text-center mb-8">
          <ShieldAlert className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">لوحة تحكم الإدارة</h2>
          <p className="text-neutral-400">يرجى إدخال الرمز السري الخاص بالإدارة</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <input 
            type="password" 
            required
            autoFocus
            className="w-full bg-neutral-700 border border-neutral-600 rounded-xl px-4 py-4 text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="••••••••"
            value={adminPassInput}
            onChange={(e) => setAdminPassInput(e.target.value)}
          />
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              دخول
            </button>
            <button 
              type="button"
              onClick={() => setView('login')}
              className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl font-bold transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => {
    const filteredMembers = members.filter(m => 
      m.name.includes(searchQuery) || m.email.includes(searchQuery) || m.phone.includes(searchQuery)
    );

    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white border-l border-neutral-200 p-6 flex flex-col gap-2">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-neutral-800">لوحة الإدارة</h3>
          </div>

          <button 
            onClick={() => setAdminView('members')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${adminView === 'members' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'hover:bg-neutral-100 text-neutral-600'}`}
          >
            <Users className="w-5 h-5" />
            الأعضاء
          </button>
          <button 
            onClick={() => setAdminView('lessons')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${adminView === 'lessons' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'hover:bg-neutral-100 text-neutral-600'}`}
          >
            <BookOpen className="w-5 h-5" />
            الدروس
          </button>
          <button 
            onClick={() => setAdminView('stats')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${adminView === 'stats' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'hover:bg-neutral-100 text-neutral-600'}`}
          >
            <BarChart3 className="w-5 h-5" />
            الإحصائيات
          </button>
          <button 
            onClick={() => setAdminView('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${adminView === 'settings' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'hover:bg-neutral-100 text-neutral-600'}`}
          >
            <Settings className="w-5 h-5" />
            الإعدادات
          </button>

          <div className="mt-auto pt-6 border-t border-neutral-100">
            <button 
              onClick={() => { setAdminAuth(false); setView('login'); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {adminView === 'members' && (
              <motion.div 
                key="members"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-neutral-800">إدارة الأعضاء</h2>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input 
                      type="text" 
                      className="input-field pr-10" 
                      placeholder="البحث عن عضو..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Members List */}
                  <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 bg-neutral-50 border-b border-neutral-200 font-bold text-neutral-700">قائمة الطلاب</div>
                    <div className="flex-1 overflow-y-auto">
                      {filteredMembers.map(member => (
                        <button 
                          key={member.id}
                          onClick={() => setSelectedMember(member)}
                          className={`w-full p-4 flex items-center gap-3 hover:bg-neutral-50 transition-all border-b border-neutral-100 last:border-0 ${selectedMember?.id === member.id ? 'bg-emerald-50 border-r-4 border-r-emerald-600' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${member.status === 'allowed' ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-500'}`}>
                            {member.name.charAt(0)}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-neutral-800">{member.name}</div>
                            <div className="text-xs text-neutral-500">{member.grade}</div>
                          </div>
                          <div className="mr-auto">
                            {member.status === 'allowed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            {member.status === 'locked' && <Lock className="w-4 h-4 text-amber-500" />}
                            {member.status === 'blocked' && <XCircle className="w-4 h-4 text-red-500" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Member Details */}
                  <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-200 p-8">
                    {selectedMember ? (
                      <div className="space-y-8">
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl font-bold">
                            {selectedMember.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-neutral-800">{selectedMember.name}</h3>
                            <p className="text-neutral-500">{selectedMember.email}</p>
                          </div>
                          <div className="mr-auto px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 font-bold text-sm">
                            {selectedMember.status === 'pending' ? 'قيد المراجعة' : 
                             selectedMember.status === 'allowed' ? 'مفعل' : 
                             selectedMember.status === 'locked' ? 'مقفل' : 'محظور'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 bg-neutral-50 rounded-2xl">
                            <div className="text-sm text-neutral-500 mb-1">رقم الهاتف</div>
                            <div className="font-bold">{selectedMember.phone}</div>
                          </div>
                          <div className="p-4 bg-neutral-50 rounded-2xl">
                            <div className="text-sm text-neutral-500 mb-1">المرحلة الدراسية</div>
                            <div className="font-bold">{selectedMember.grade}</div>
                          </div>
                          <div className="p-4 bg-neutral-50 rounded-2xl">
                            <div className="text-sm text-neutral-500 mb-1">الرقم السري</div>
                            <div className="font-bold">{selectedMember.password}</div>
                          </div>
                          <div className="p-4 bg-neutral-50 rounded-2xl">
                            <div className="text-sm text-neutral-500 mb-1">أيام الاشتراك</div>
                            <div className="flex items-center gap-3">
                              <input 
                                type="number" 
                                className="w-20 bg-white border border-neutral-200 rounded-lg px-2 py-1 text-center font-bold"
                                value={manualDays}
                                onChange={(e) => setManualDays(parseInt(e.target.value) || 0)}
                              />
                              <span className="font-bold">يوم</span>
                              <button 
                                onClick={() => updateSubscription(selectedMember.id, manualDays)}
                                className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg font-bold hover:bg-emerald-700 transition-all"
                              >
                                حفظ
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-neutral-100">
                          <h4 className="font-bold text-neutral-800 mb-4">إجراءات التحكم</h4>
                          <div className="flex flex-wrap gap-3">
                            <button 
                              onClick={() => updateMemberStatus(selectedMember.id, 'allowed')}
                              className="flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-all"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              سماح
                            </button>
                            <button 
                              onClick={() => updateMemberStatus(selectedMember.id, 'locked')}
                              className="flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-700 rounded-xl font-bold hover:bg-amber-200 transition-all"
                            >
                              <Lock className="w-5 h-5" />
                              إقفال
                            </button>
                            <button 
                              onClick={() => updateMemberStatus(selectedMember.id, 'blocked')}
                              className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all"
                            >
                              <XCircle className="w-5 h-5" />
                              حظر الطالب
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-4">
                        <Users className="w-16 h-16 opacity-20" />
                        <p>اختر عضواً من القائمة لعرض بياناته</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {adminView === 'lessons' && (
              <motion.div 
                key="lessons"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-neutral-800">إدارة الدروس</h2>
                <Card className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">الدروس المسجلة</h3>
                    <p className="text-neutral-500 mb-6">يمكنك الوصول إلى المحتوى التعليمي عبر الرابط التالي</p>
                    <button 
                      onClick={() => openExternalLink('https://linkthread.com/mainpage')}
                      className="btn-primary flex items-center gap-2 mx-auto"
                    >
                      <ExternalLink className="w-5 h-5" />
                      فتح صفحة الدروس
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}

            {adminView === 'stats' && (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-neutral-800">إحصائيات المنصة</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="text-center p-10">
                    <div className="text-emerald-600 font-bold text-5xl mb-2">
                      {stats?.totalUsers || 0}
                    </div>
                    <div className="text-neutral-500">إجمالي الأعضاء</div>
                  </Card>
                  <Card className="text-center p-10">
                    <div className="text-emerald-600 font-bold text-5xl mb-2">
                      {stats?.stats?.find((s:any) => s.key === 'visitors')?.value || 0}
                    </div>
                    <div className="text-neutral-500">عدد الزوار</div>
                  </Card>
                  <Card className="text-center p-10">
                    <div className="text-emerald-600 font-bold text-5xl mb-2">
                      {stats?.stats?.find((s:any) => s.key === 'lessons_watched')?.value || 0}
                    </div>
                    <div className="text-neutral-500">دروس تمت مشاهدتها</div>
                  </Card>
                </div>
              </motion.div>
            )}

            {adminView === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-neutral-800">إعدادات النظام</h2>
                <Card className="max-w-md">
                  <h3 className="font-bold text-neutral-800 mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    تغيير الرقم السري للإدارة
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-500 mb-1">الرقم السري الجديد</label>
                      <input 
                        type="password" 
                        className="input-field" 
                        placeholder="أدخل الرمز الجديد"
                        value={newAdminPass}
                        onChange={(e) => setNewAdminPass(e.target.value)}
                      />
                    </div>
                    <button onClick={changeAdminPass} className="btn-primary w-full">حفظ التغييرات</button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderStudentDashboard = () => (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">
            {user?.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-neutral-800">{user?.name}</div>
            <div className="text-xs text-neutral-500">{user?.grade}</div>
          </div>
        </div>
        <button 
          onClick={() => { setUser(null); setView('login'); }}
          className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      <main className="p-6 max-w-4xl mx-auto space-y-8">
        <div className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">أهلاً بك يا {user?.name.split(' ')[0]}!</h2>
            <p className="opacity-90 mb-6">لديك {user?.subscription_days} أيام متبقية في اشتراكك.</p>
            <button 
              onClick={() => openExternalLink('https://linkthread.com/mainpage')}
              className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              ابدأ التعلم الآن
            </button>
          </div>
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              آخر الدروس
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <button 
                  key={i}
                  onClick={() => openExternalLink('https://linkthread.com/mainpage')}
                  className="w-full p-4 bg-neutral-50 rounded-2xl flex items-center justify-between hover:bg-neutral-100 transition-all group"
                >
                  <div className="text-right">
                    <div className="font-bold text-neutral-700">الدرس التعليمي {i}</div>
                    <div className="text-xs text-neutral-400">منذ يومين</div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-neutral-300 group-hover:text-emerald-600 transition-all" />
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              معلومات الحساب
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-neutral-500">البريد الإلكتروني</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-neutral-500">رقم الهاتف</span>
                <span className="font-medium">{user?.phone}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-500">حالة الاشتراك</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">نشط</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );


  return (
    <div className="font-sans">
      <AnimatePresence mode="wait">
        {view === 'login' && renderLogin()}
        {view === 'register' && renderRegister()}
        {view === 'subscription_success' && renderSubscriptionSuccess()}
        {view === 'admin_login' && renderAdminLogin()}
        {view === 'admin_dashboard' && renderAdminDashboard()}
        {view === 'student_dashboard' && renderStudentDashboard()}
      </AnimatePresence>
    </div>
  );
}
