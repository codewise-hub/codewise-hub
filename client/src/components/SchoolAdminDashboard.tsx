import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, GraduationCap, School, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, School as SchoolType } from "@shared/schema";

interface SchoolAdminDashboardProps {
  user: User;
}

export function SchoolAdminDashboard({ user }: SchoolAdminDashboardProps) {
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    role: "",
    grade: "",
    ageGroup: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get school information
  const { data: school } = useQuery<SchoolType>({
    queryKey: ["/api/schools", user.schoolId],
    enabled: !!user.schoolId,
  });

  // Get school users (teachers and students)
  const { data: schoolUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/schools", user.schoolId, "users"],
    enabled: !!user.schoolId,
  });

  // Create new user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserForm) => {
      return apiRequest("/api/schools/create-user", {
        method: "POST",
        body: {
          ...userData,
          schoolId: user.schoolId,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: `${newUserForm.role} account created successfully.`,
      });
      setNewUserForm({ name: "", email: "", role: "", grade: "", ageGroup: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/schools", user.schoolId, "users"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create user account.",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!newUserForm.name || !newUserForm.email || !newUserForm.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUserForm);
  };

  const getStatsCards = () => {
    const teachers = schoolUsers?.filter(u => u.role === 'teacher') || [];
    const students = schoolUsers?.filter(u => u.role === 'student') || [];
    
    return [
      {
        title: "Total Students",
        value: students.length,
        icon: GraduationCap,
        color: "text-blue-600",
      },
      {
        title: "Total Teachers",
        value: teachers.length,
        icon: Users,
        color: "text-green-600",
      },
      {
        title: "School Capacity",
        value: `${students.length}/${school?.maxStudents || 0}`,
        icon: School,
        color: "text-purple-600",
      },
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            School Administration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {school?.name || "School Dashboard"}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          School Admin
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getStatsCards().map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Manage Users</TabsTrigger>
          <TabsTrigger value="create">Create Account</TabsTrigger>
          <TabsTrigger value="settings">School Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Users</CardTitle>
              <CardDescription>
                Manage teachers and students in your school
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Teachers</h3>
                    <div className="space-y-2">
                      {schoolUsers?.filter(u => u.role === 'teacher').map(teacher => (
                        <div key={teacher.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{teacher.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{teacher.email}</p>
                            {teacher.subjects && (
                              <p className="text-xs text-gray-500">
                                Subjects: {JSON.parse(teacher.subjects).join(', ')}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">Teacher</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Students</h3>
                    <div className="space-y-2">
                      {schoolUsers?.filter(u => u.role === 'student').map(student => (
                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                            <div className="flex gap-2 text-xs text-gray-500">
                              {student.grade && <span>Grade: {student.grade}</span>}
                              {student.ageGroup && <span>Age: {student.ageGroup}</span>}
                            </div>
                          </div>
                          <Badge variant="outline">Student</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create New Account
              </CardTitle>
              <CardDescription>
                Add new teachers or students to your school
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    data-testid="input-user-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    data-testid="input-user-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUserForm.role}
                    onValueChange={(value) => setNewUserForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger data-testid="select-user-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newUserForm.role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        value={newUserForm.grade}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, grade: e.target.value }))}
                        placeholder="e.g., Grade 5"
                        data-testid="input-student-grade"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ageGroup">Age Group</Label>
                      <Select
                        value={newUserForm.ageGroup}
                        onValueChange={(value) => setNewUserForm(prev => ({ ...prev, ageGroup: value }))}
                      >
                        <SelectTrigger data-testid="select-age-group">
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6-11">6-11 years (Visual Programming)</SelectItem>
                          <SelectItem value="12-17">12-17 years (Text Programming)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending}
                className="w-full"
                data-testid="button-create-user"
              >
                {createUserMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                School Settings
              </CardTitle>
              <CardDescription>
                Manage your school information and subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {school && (
                <div className="space-y-4">
                  <div>
                    <Label>School Name</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{school.name}</p>
                  </div>
                  <div>
                    <Label>Subscription Status</Label>
                    <Badge variant={school.subscriptionStatus === 'active' ? 'default' : 'destructive'}>
                      {school.subscriptionStatus}
                    </Badge>
                  </div>
                  <div>
                    <Label>Student Capacity</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {school.currentStudents} / {school.maxStudents} students
                    </p>
                  </div>
                  {school.subscriptionEnd && (
                    <div>
                      <Label>Subscription End Date</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(school.subscriptionEnd).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}