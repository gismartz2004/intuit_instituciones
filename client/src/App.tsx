import { Switch, Route, Redirect, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import StudentDashboard from "@/pages/StudentDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ProfessorDashboard from "@/pages/ProfessorDashboard";
import CodingLab from "@/pages/CodingLab";
import Login from "@/pages/Login";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const [user, setUser] = useState<{ role: "student" | "admin" | "professor"; name: string; plan?: string } | null>(null);
  const [location, setLocation] = useLocation();

  const handleLogin = (role: "student" | "admin" | "professor", name: string) => {
    setUser({ role, name, plan: role === "student" ? "Digital" : undefined });
  };

  const handleLogout = () => {
    setUser(null);
    setLocation("/login");
  };

  // If not logged in and not on login page, redirect to login
  if (!user && location !== "/login") {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      {user && location !== "/login" && location !== "/lab" && (
        <>
          <Sidebar currentRole={user.role} onRoleChange={(r) => setUser({ ...user, role: r })} />
          <MobileNav currentRole={user.role} />
        </>
      )}
      
      <main className={`flex-1 min-h-screen bg-slate-50/50 ${user && location !== "/login" && location !== "/lab" ? "md:ml-[280px] pb-20 md:pb-0" : ""}`}>
        <Switch>
          <Route path="/login">
            {user ? <Redirect to="/" /> : <Login onLogin={handleLogin} />}
          </Route>
          
          <Route path="/">
            {!user ? <Redirect to="/login" /> : 
             user.role === "admin" ? <Redirect to="/admin" /> : 
             user.role === "professor" ? <Redirect to="/teach" /> :
             <Redirect to="/dashboard" />}
          </Route>
          
          <Route path="/dashboard" component={StudentDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/teach" component={ProfessorDashboard} />
          <Route path="/lab" component={CodingLab} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/profile">
            {user ? <Profile user={user} /> : <Redirect to="/login" />}
          </Route>
          
          <Route>
            <div className="p-8 flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-300">404 - Página no encontrada</h1>
              </div>
            </div>
          </Route>
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
