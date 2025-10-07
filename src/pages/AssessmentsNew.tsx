import { useState, useEffect } from "react";
import { Plus, Eye, Save, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { QuestionType, Question, AssessmentSection } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "single-choice", label: "Single Choice" },
  { value: "multi-choice", label: "Multiple Choice" },
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "numeric", label: "Numeric" },
  { value: "file-upload", label: "File Upload" },
];

const AssessmentsNew = () => {
  const [sections, setSections] = useState<AssessmentSection[]>(() => {
    const saved = localStorage.getItem("assessment-builder-state");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "section-1",
            title: "General Questions",
            description: "",
            order: 0,
            questions: [],
          },
        ];
  });
  const [showPreview, setShowPreview] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem("assessment-responses");
    return saved ? JSON.parse(saved) : {};
  });

  // Persist builder state to localStorage
  useEffect(() => {
    localStorage.setItem("assessment-builder-state", JSON.stringify(sections));
  }, [sections]);

  // Persist responses to localStorage
  useEffect(() => {
    localStorage.setItem("assessment-responses", JSON.stringify(responses));
  }, [responses]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: `section-${Date.now()}`,
        title: `Section ${sections.length + 1}`,
        description: "",
        order: sections.length,
        questions: [],
      },
    ]);
  };

  const updateSection = (sectionId: string, title: string) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, title } : s))
    );
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const addQuestion = (sectionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: [
                ...s.questions,
                {
                  id: `question-${Date.now()}`,
                  type: "short-text" as QuestionType,
                  text: "",
                  required: false,
                  order: s.questions.length,
                },
              ],
            }
          : s
      )
    );
  };

  const updateQuestion = (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>
  ) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId ? { ...q, ...updates } : q
              ),
            }
          : s
      )
    );
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.filter((q) => q.id !== questionId),
            }
          : s
      )
    );
  };

  const validateForm = () => {
    for (const section of sections) {
      for (const question of section.questions) {
        if (question.required && !responses[question.id]) {
          return false;
        }
        if (
          question.type === "numeric" &&
          responses[question.id] !== undefined
        ) {
          const value = Number(responses[question.id]);
          if (question.minValue !== undefined && value < question.minValue) {
            return false;
          }
          if (question.maxValue !== undefined && value > question.maxValue) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const shouldShowQuestion = (question: Question) => {
    if (!question.conditionalOn) return true;

    const conditionalResponse = responses[question.conditionalOn.questionId];
    const expectedValue = question.conditionalOn.value;

    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(conditionalResponse);
    }
    return conditionalResponse === expectedValue;
  };

  const handleSave = () => {
    toast.success("Assessment saved successfully");
  };

  const handleSubmit = () => {
    if (validateForm()) {
      toast.success("Assessment submitted successfully");
      setResponses({});
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Assessment Builder</h2>
          <p className="text-muted-foreground mt-1">
            Create custom assessments with various question types
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Builder */}
        {!showPreview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Builder</h3>
              <Button onClick={addSection} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>

            {sections.map((section, sectionIndex) => (
              <Card key={section.id} className="bg-primary/5 border-primary/20">
                <CardHeader className="bg-primary/10">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, e.target.value)}
                      className="font-semibold bg-card"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {section.questions.map((question, questionIndex) => (
                    <Card key={question.id} className="bg-secondary/50 border-primary/10">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-3">
                            <div>
                              <Label>Question Type</Label>
                              <Select
                                value={question.type}
                                onValueChange={(value) =>
                                  updateQuestion(section.id, question.id, {
                                    type: value as QuestionType,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {questionTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Question Text</Label>
                              <Textarea
                                value={question.text}
                                onChange={(e) =>
                                  updateQuestion(section.id, question.id, {
                                    text: e.target.value,
                                  })
                                }
                                placeholder="Enter your question..."
                                rows={2}
                              />
                            </div>

                            {(question.type === "single-choice" ||
                              question.type === "multi-choice") && (
                              <div>
                                <Label>Options (comma-separated)</Label>
                                <Input
                                  value={question.options?.join(", ") || ""}
                                  onChange={(e) =>
                                    updateQuestion(section.id, question.id, {
                                      options: e.target.value
                                        .split(",")
                                        .map((o) => o.trim())
                                        .filter(Boolean),
                                    })
                                  }
                                  placeholder="Option 1, Option 2, Option 3"
                                />
                              </div>
                            )}

                            {question.type === "numeric" && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label>Min Value</Label>
                                  <Input
                                    type="number"
                                    value={question.minValue || ""}
                                    onChange={(e) =>
                                      updateQuestion(section.id, question.id, {
                                        minValue: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Max Value</Label>
                                  <Input
                                    type="number"
                                    value={question.maxValue || ""}
                                    onChange={(e) =>
                                      updateQuestion(section.id, question.id, {
                                        maxValue: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            )}

                            {(question.type === "short-text" ||
                              question.type === "long-text") && (
                              <div>
                                <Label>Max Length</Label>
                                <Input
                                  type="number"
                                  value={question.maxLength || ""}
                                  onChange={(e) =>
                                    updateQuestion(section.id, question.id, {
                                      maxLength: Number(e.target.value),
                                    })
                                  }
                                  placeholder="Leave empty for no limit"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Switch
                                checked={question.required}
                                onCheckedChange={(checked) =>
                                  updateQuestion(section.id, question.id, {
                                    required: checked,
                                  })
                                }
                              />
                              <Label>Required</Label>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteQuestion(section.id, question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(section.id)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Preview */}
        <div className={cn("space-y-4", !showPreview && "lg:col-start-2")}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {showPreview ? "Assessment Form" : "Live Preview"}
            </h3>
            {showPreview && responses && Object.keys(responses).length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setResponses({});
                  toast.success("Form cleared");
                }}
              >
                Clear Form
              </Button>
            )}
          </div>

          {sections.map((section) => (
            <Card key={section.id} className="bg-gradient-to-br from-secondary/30 to-secondary/10 border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-primary">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {section.questions
                  .filter((q) => shouldShowQuestion(q))
                  .map((question) => (
                    <div key={question.id} className="space-y-2">
                      <Label>
                        {question.text}
                        {question.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>

                      {question.type === "single-choice" && (
                        <Select
                          value={responses[question.id]}
                          onValueChange={(value) =>
                            setResponses({ ...responses, [question.id]: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {question.type === "multi-choice" && (
                        <div className="space-y-2">
                          {question.options?.map((option) => (
                            <div key={option} className="flex items-center gap-2">
                              <Checkbox
                                checked={
                                  responses[question.id]?.includes(option) || false
                                }
                                onCheckedChange={(checked) => {
                                  const current = responses[question.id] || [];
                                  const updated = checked
                                    ? [...current, option]
                                    : current.filter((o: string) => o !== option);
                                  setResponses({ ...responses, [question.id]: updated });
                                }}
                              />
                              <Label className="cursor-pointer">{option}</Label>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === "short-text" && (
                        <Input
                          value={responses[question.id] || ""}
                          onChange={(e) =>
                            setResponses({ ...responses, [question.id]: e.target.value })
                          }
                          maxLength={question.maxLength}
                          placeholder="Your answer..."
                        />
                      )}

                      {question.type === "long-text" && (
                        <Textarea
                          value={responses[question.id] || ""}
                          onChange={(e) =>
                            setResponses({ ...responses, [question.id]: e.target.value })
                          }
                          maxLength={question.maxLength}
                          placeholder="Your answer..."
                          rows={4}
                        />
                      )}

                      {question.type === "numeric" && (
                        <Input
                          type="number"
                          value={responses[question.id] || ""}
                          onChange={(e) =>
                            setResponses({
                              ...responses,
                              [question.id]: e.target.value,
                            })
                          }
                          min={question.minValue}
                          max={question.maxValue}
                          placeholder="Enter a number..."
                        />
                      )}

                      {question.type === "file-upload" && (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <p className="text-sm text-muted-foreground">
                            File upload functionality (stub)
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Choose File
                          </Button>
                        </div>
                      )}

                      {question.maxLength && (
                        <p className="text-xs text-muted-foreground">
                          Max {question.maxLength} characters
                        </p>
                      )}
                      {question.type === "numeric" &&
                        (question.minValue !== undefined ||
                          question.maxValue !== undefined) && (
                          <p className="text-xs text-muted-foreground">
                            Range: {question.minValue ?? "∞"} to{" "}
                            {question.maxValue ?? "∞"}
                          </p>
                        )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}

          {showPreview && (
            <Button onClick={handleSubmit} className="w-full" size="lg">
              Submit Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentsNew;
