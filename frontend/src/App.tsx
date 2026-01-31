
import { Switch, Route, Redirect, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import StudentDashboard3D from "@/pages/StudentDashboard3D";
import Leaderboard from "@/features/leaderboard/components/Leaderboard";
import Missions from "@/pages/Missions";
import NotFound from "@/pages/not-found";
import { StudentDashboard, LevelViewer, WorldSelector } from "@/features/student";
import { AdminDashboard } from "@/features/admin";
import { ProfessorDashboard, CourseEditor, FileSystem, GradingDashboard } from "@/features/professor";
import { CodingLab, ArduinoLab } from "@/features/labs";
import { Login } from "@/features/auth";
import { Profile } from "@/features/profile";
import { AITutor, ProCourses } from "@/features/courses";
import { GamerRaffle, MissionsHub } from "@/features/gamification";
import { SuperAdminDashboard } from "@/features/superadmin";
import { Toaster } from "@/components/ui/toaster";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { notificationService } from "@/services/notification.service";

function App() {
  const [user, setUser] = useState<{ role: "student" | "admin" | "professor" | "superadmin"; name: string; id: string; plan?: string } | null>(() => {
    // Initialize state from local storage
    const savedUser = localStorage.getItem("edu_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("edu_token");
  });
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      notificationService.requestPermission();
    }
  }, [user]);

  const handleLogin = (role: "student" | "admin" | "professor" | "superadmin", name: string, id: string, planId?: number, accessToken?: string) => {
    const userData = { role, name, id, plan: planId ? planId.toString() : undefined };
    setUser(userData);
    localStorage.setItem("edu_user", JSON.stringify(userData));

    if (accessToken) {
      setToken(accessToken);
      localStorage.setItem("edu_token", accessToken);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("edu_user");
    localStorage.removeItem("edu_token");
    setLocation("/login");
  };

  // If not logged in and not on login page, redirect to login
  if (!user && location !== "/login") {
    return <Redirect to="/login" />;
  }

  const isManagementRoute = location.startsWith("/admin") || location.startsWith("/superadmin");
  const isLevelRoute = location.startsWith("/level");
  const showNav = user && location !== "/login" && location !== "/lab" && location !== "/arduino-lab" && !isManagementRoute && !isLevelRoute;

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {showNav && (
        <>
          <Sidebar
            currentRole={user.role}
            onRoleChange={(r) => setUser({ ...user, role: r })}
            onLogout={handleLogout}
            userPlanId={user.plan ? parseInt(user.plan) : 1}
          />
          <MobileHeader
            currentRole={user.role}
            onLogout={handleLogout}
            userPlanId={user.plan ? parseInt(user.plan) : 1}
          />
          <MobileNav
            currentRole={user.role}
            onLogout={handleLogout}
            userPlanId={user.plan ? parseInt(user.plan) : 1}
          />
        </>
      )}

      <main className={cn(
        "flex-1 min-h-screen bg-slate-50/50",
        showNav ? "md:ml-[280px] pt-14 md:pt-0 pb-24 md:pb-0" : ""
      )}>
        <Switch>
          <Route path="/login">
            {user ? <Redirect to="/" /> : <Login onLogin={handleLogin} />}
          </Route>

          <Route path="/">
            {!user ? <Redirect to="/login" /> :
              user.role === "superadmin" ? <Redirect to="/superadmin" /> :
                user.role === "admin" ? <Redirect to="/admin" /> :
                  user.role === "professor" ? <Redirect to="/teach" /> :
                    <Redirect to="/dashboard" />}
          </Route>

          <Route path="/dashboard">
            <WorldSelector user={user!} />
          </Route>
          <Route path="/dashboard/module/:moduleId">
            <StudentDashboard user={user!} />
          </Route>
          <Route path="/dashboard-3d">
            <StudentDashboard3D user={user!} />
          </Route>
          <Route path="/admin">
            <AdminDashboard user={user!} onLogout={handleLogout} />
          </Route>
          <Route path="/admin/users">
            <AdminDashboard user={user!} onLogout={handleLogout} />
          </Route>
          <Route path="/superadmin" component={SuperAdminDashboard} />
          <Route path="/teach">
            <ProfessorDashboard user={user!} />
          </Route>
          <Route path="/teach/grading" component={GradingDashboard} />
          <Route path="/teach/module/:id" component={CourseEditor} />
          <Route path="/lab" component={CodingLab} />
          <Route path="/arduino-lab" component={ArduinoLab} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/ai-tutor" component={AITutor} />
          <Route path="/pro-courses" component={ProCourses} />
          <Route path="/gamer-raffle" component={GamerRaffle} />
          <Route path="/level/:levelId" component={LevelViewer} />
          <Route path="/quests" component={MissionsHub} />
          <Route path="/missions" component={MissionsHub} />
          <Route path="/files" component={FileSystem} />
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
