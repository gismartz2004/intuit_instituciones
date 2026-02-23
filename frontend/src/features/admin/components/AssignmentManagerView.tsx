import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronLeft,
  Users,
  BookOpen,
  UserPlus,
  UserMinus,
  CheckCircle2,
  Library,
} from "lucide-react";
import { adminApi } from "../services/admin.api";
import { User as Student, CourseWithStats } from "../types/admin.types";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AssignmentManagerViewProps {
  onBack?: () => void;
}

export function AssignmentManagerView({ onBack }: AssignmentManagerViewProps) {
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithStats | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [professors, setProfessors] = useState<Student[]>([]);
  const [selectedProfessorId, setSelectedProfessorId] =
    useState<string>("none");

  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadAssignedStudents(selectedCourse.id);
    }
  }, [selectedCourse]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [coursesData, studentsData, professorsData] = await Promise.all([
        adminApi.getCourses(),
        adminApi.getSystemStudents(),
        adminApi.getSystemProfessors(),
      ]);
      setCourses(coursesData);
      setStudents(studentsData);
      setProfessors(professorsData);
      if (coursesData.length > 0) {
        setSelectedCourse(coursesData[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos iniciales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedStudents = async (courseId: number) => {
    try {
      const data = await adminApi.getCourseAssignments(courseId);
      setAssignedStudents(data);

      // Set current professor from first module if any (simplified)
      if (data.length > 0 && data[0].profesorId) {
        setSelectedProfessorId(data[0].profesorId.toString());
      } else {
        setSelectedProfessorId("none");
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
    }
  };

  const handleAssignProfessor = async (professorId: string) => {
    // Note: In course-level, this might need to update all modules. 
    // For now, we keep it simple or show a message that professor assignment is per module.
    toast({
      title: "Información",
      description: "La asignación de profesor se gestiona actualmente por módulo individual en el editor de cursos.",
    });
  };

  const handleAssign = async (studentId: number) => {
    if (!selectedCourse) return;
    setActionLoading(studentId);
    try {
      const professorId =
        selectedProfessorId === "none"
          ? undefined
          : parseInt(selectedProfessorId);

      await adminApi.bulkAssignCourse(
        selectedCourse.id,
        [studentId],
        professorId,
      );

      toast({
        title: "Curso asignado",
        description: "El estudiante ahora tiene acceso a todos los módulos del curso",
      });
      await loadAssignedStudents(selectedCourse.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la asignación del curso",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnassign = async (studentId: number) => {
    if (!selectedCourse) return;
    setActionLoading(studentId);
    try {
      await adminApi.bulkUnassignCourse(selectedCourse.id, studentId);
      toast({
        title: "Asignación eliminada",
        description: "El estudiante fue removido del curso completo",
      });
      await loadAssignedStudents(selectedCourse.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la asignación",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const assignedIds = new Set(assignedStudents.map((s) => s.id));

  const filteredCourses = courses.filter((c) =>
    (c.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredStudents = students.filter(
    (s) =>
      ((s.nombre || "").toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(studentSearch.toLowerCase())) &&
      !assignedIds.has(s.id),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] bg-white rounded-2xl border border-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">
          Cargando Gestor de Asignaciones...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden h-[calc(100vh-160px)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full hover:bg-slate-100"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Library className="w-5 h-5 text-blue-600" />
              Gestión de Asignaciones por Curso
            </h1>
            <p className="text-sm text-slate-500">
              Cursos &gt; Asignaciones Globales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
          >
            {students.length} Estudiantes Totales
          </Badge>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row overflow-hidden flex-1 min-h-0">
        {/* Left Panel: Modules List */}
        <aside className="w-full xl:w-80 bg-white border-r flex flex-col overflow-hidden shadow-sm min-h-0">
          <div className="p-4 border-b bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar curso..."
                className="pl-9 bg-white border-slate-200 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hidden p-3 space-y-2">
            {filteredCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-left p-4 rounded-xl transition-all border-2 ${selectedCourse?.id === course.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border-transparent hover:border-slate-100 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${selectedCourse?.id === course.id ? "bg-white/20" : "bg-blue-50 text-blue-600"}`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{course.nombre}</div>
                    <div
                      className={`text-xs ${selectedCourse?.id === course.id ? "text-blue-100" : "text-slate-400"}`}
                    >
                      {course.moduleCount} Módulos
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto scrollbar-hidden p-4 flex flex-col gap-8 min-h-0">
          {selectedCourse && (
            <>
              <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                    {selectedCourse.nombre}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border-none px-3">
                      {assignedStudents.length} Estudiantes con Acceso
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-slate-200 text-slate-500"
                    >
                      ID: #{selectedCourse.id}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-64">
                  <Label className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    Profesor a Cargo
                  </Label>
                  <Select
                    value={selectedProfessorId}
                    onValueChange={handleAssignProfessor}
                  >
                    <SelectTrigger className="bg-white border-slate-200 rounded-xl h-11">
                      <SelectValue placeholder="Seleccionar profesor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        Sin profesor asignado
                      </SelectItem>
                      {professors.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id.toString()}>
                          {prof.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Assigned Students */}
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden ring-1 ring-slate-100">
                  <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
                    <CardTitle className="text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Con Acceso al Curso
                      </div>
                      <span className="text-sm font-normal text-emerald-600">
                        {assignedStudents.length} alumnos
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <Table>
                      <TableHeader className="bg-emerald-50/20">
                        <TableRow className="hover:bg-transparent border-emerald-100/50">
                          <TableHead className="text-emerald-700 font-bold">
                            Estudiante
                          </TableHead>
                          <TableHead className="text-emerald-700 font-bold text-center">
                            Acción
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedStudents.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-center py-12 text-slate-400 italic"
                            >
                              Nadie ha sido asignado aún.
                            </TableCell>
                          </TableRow>
                        ) : (
                          assignedStudents.map((student) => (
                            <TableRow
                              key={student.id}
                              className="hover:bg-emerald-50/10 border-emerald-100/30"
                            >
                              <TableCell>
                                <div className="font-bold text-slate-800">
                                  {student.nombre}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {student.email}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnassign(student.id)}
                                  disabled={actionLoading === student.id}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg group"
                                >
                                  <UserMinus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                  Quitar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Available Students (To Assign) */}
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden ring-1 ring-slate-100 flex flex-col">
                  <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                    <CardTitle className="text-blue-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Disponibles para Asignar
                      </div>
                    </CardTitle>
                    <div className="relative mt-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Filtrar por nombre o email..."
                        className="pl-9 h-10 bg-white border-blue-100 rounded-xl focus:ring-blue-200"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <div className="flex-1 overflow-y-auto p-2">
                    <Table>
                      <TableHeader className="bg-blue-50/20 sticky top-0 z-10">
                        <TableRow className="hover:bg-transparent border-blue-100/50">
                          <TableHead className="text-blue-700 font-bold">
                            Estudiante
                          </TableHead>
                          <TableHead className="text-blue-700 font-bold text-center">
                            Acción
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-center py-12 text-slate-400 italic"
                            >
                              {studentSearch
                                ? "No se encontraron coincidencias"
                                : "Todos los alumnos están asignados"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStudents.map((student) => (
                            <TableRow
                              key={student.id}
                              className="hover:bg-blue-50/10 border-blue-100/30"
                            >
                              <TableCell>
                                <div className="font-bold text-slate-800">
                                  {student.nombre}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {student.email}
                                </div>
                              </TableCell>
                              <TableCell className="text-center p-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleAssign(student.id)}
                                  disabled={actionLoading === student.id}
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 shadow-sm group"
                                >
                                  <UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                  Asignar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
