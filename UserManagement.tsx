import React, { useState } from "react";

const UserManagement: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [plan, setPlan] = useState("digital");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { email, name, role, plan: role === 'student' ? plan : null, password: 'defaultPassword' }; // La contraseña debe manejarse de forma segura
    console.log("Enviando para crear usuario:", userData);
    
    // Ejemplo de llamada a la API
    // const response = await fetch('/api/admin/users', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData),
    // });
    // const result = await response.json();
    // console.log(result);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Gestión de Usuarios</h2>
      <form onSubmit={handleCreateUser} className="space-y-4">
        <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2">
          <option value="student">Estudiante</option>
          <option value="teacher">Profesor</option>
          <option value="admin">Administrador</option>
        </select>
        {role === "student" && (
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="digital">Genio Digital ($3)</option>
            <option value="plata">Genio Plata ($4.99)</option>
            <option value="pro">Genio Pro ($7.99)</option>
          </select>
        )}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
          Crear Usuario
        </button>
      </form>
      <div className="mt-8">
        <h3 className="text-xl font-semibold">Usuarios Existentes</h3>
        <p className="text-gray-500 mt-2 text-sm">La lista de usuarios y las opciones para editar/deshabilitar aparecerán aquí.</p>
      </div>
    </div>
  );
};

export default UserManagement;