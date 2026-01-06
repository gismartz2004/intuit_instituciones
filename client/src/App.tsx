import { Switch, Route, Redirect } from "wouter";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import StudentDashboard from "@/pages/StudentDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ProfessorDashboard from "@/pages/ProfessorDashboard";
import CodingLab from "@/pages/CodingLab";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const [role, setRole] = useState<"student" | "admin" | "professor">("student");

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar currentRole={role} onRoleChange={setRole} />
      <MobileNav currentRole={role} />
      
      <main className="flex-1 md:ml-[280px] min-h-screen bg-slate-50/50 pb-20 md:pb-0">
        <Switch>
          <Route path="/">
            {role === "admin" ? <Redirect to="/admin" /> : 
             role === "professor" ? <Redirect to="/teach" /> :
             <Redirect to="/dashboard" />}
          </Route>
          
          <Route path="/dashboard" component={StudentDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/teach" component={ProfessorDashboard} />
          <Route path="/lab" component={CodingLab} />
          
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
