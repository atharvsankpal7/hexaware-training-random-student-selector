"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, UserPlus, Shuffle, Loader2 } from "lucide-react";

export default function StudentSelector() {
  const [students, setStudents] = useState<string[]>([]);
  const [newStudent, setNewStudent] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [remainingStudents, setRemainingStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch students when component mounts
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    setRemainingStudents(students);
  }, [students]);

  const saveStudents = async (updatedStudents: string[]) => {
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ students: updatedStudents }),
      });
      if (!response.ok) {
        throw new Error("Failed to save students");
      }
    } catch (error) {
      console.error("Error saving students:", error);
    }
  };

  const addStudent = () => {
    if (newStudent.trim() !== "") {
      const newStudents = newStudent.split(",");
      const updatedStudents = [
        ...students,
        ...newStudents.map((e) => e.trim()),
      ];
      setStudents(updatedStudents);
      setNewStudent("");
      saveStudents(updatedStudents);
    }
  };

  const removeStudent = (index: number) => {
    const updatedStudents = students.filter((_, i) => i !== index);
    setStudents(updatedStudents);
    setRemainingStudents(updatedStudents);
    saveStudents(updatedStudents);
  };

  const removeAllStudents = () => {
    setStudents([]);
    setRemainingStudents([]);
    saveStudents([]);
  };

  const selectRandomStudent = () => {
    if (remainingStudents.length > 0) {
      // Use a reliable random index selection to pick a student
      const timestamp = new Date().getTime();
      const seed = Math.sin(timestamp) * 10000; // Seed based on timestamp
      const randomValue = (Math.abs(Math.sin(seed)) + Math.random()) % 1; // Generate random value with a slight entropy boost
      const randomIndex = Math.floor(randomValue * remainingStudents.length); // Select random index
  
      const shuffledStudents = [...remainingStudents];
      // Swap shuffle for better randomness
      for (let i = shuffledStudents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
      }
  
      const selected = shuffledStudents[randomIndex];
      setSelectedStudent(selected);
      setRemainingStudents(
        remainingStudents.filter((student) => student !== selected)
      );
    } else {
      setSelectedStudent("All students have presented!");
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-purple-700 animate-fade-in">
            Who&apos;s Next??
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <Tabs defaultValue="input" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">Input</TabsTrigger>
                <TabsTrigger value="selection">Selection</TabsTrigger>
              </TabsList>
              <TabsContent value="input" className="space-y-4">
                <div className="flex space-x-2 mt-4">
                  <Input
                    type="text"
                    placeholder="Enter student name"
                    value={newStudent}
                    onChange={(e) => setNewStudent(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addStudent()}
                    className="flex-grow transition-all duration-200"
                  />
                  <Button
                    onClick={addStudent}
                    className="bg-green-500 hover:bg-green-600 transition-colors duration-200"
                  >
                    <UserPlus className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {students.map((student, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white p-2 rounded-md transform transition-all duration-200 hover:scale-102 animate-fade-in border hover:border-red-300"
                    >
                      <span>{student}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStudent(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500 transition-transform duration-200 hover:scale-110" />
                      </Button>
                    </div>
                  ))}
                </div>
                {students.length > 0 && (
                  <Button
                    onClick={removeAllStudents}
                    className="w-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete All Students
                  </Button>
                )}
              </TabsContent>
              <TabsContent value="selection" className="space-y-4">
                <Button
                  onClick={selectRandomStudent}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4 transform transition-all duration-200 hover:scale-105"
                  disabled={remainingStudents.length === 0}
                >
                  <Shuffle className="w-5 h-5 mr-2 animate-spin-slow" />
                  Select Random Student
                </Button>

                {selectedStudent && (
                  <div className="bg-indigo-100 p-4 rounded-lg text-center transform transition-all duration-300 animate-fade-in">
                    <h3 className="text-lg font-semibold text-indigo-800">
                      Selected Student:
                    </h3>
                    <p className="text-2xl font-bold mt-2 animate-bounce text-amber-500 drop-shadow-lg hover:text-amber-600 transition-colors  tracking-wide">
                      {selectedStudent}
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-600 text-center transition-opacity duration-200">
                  Remaining students: {remainingStudents.length} /{" "}
                  {students.length}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
