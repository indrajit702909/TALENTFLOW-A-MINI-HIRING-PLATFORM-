import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Job } from "@/types";

const jobSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  slug: z.string().trim().min(1, "Slug is required").max(100),
  department: z.string().trim().min(1, "Department is required"),
  location: z.string().trim().min(1, "Location is required"),
  description: z.string().trim().min(1, "Description is required").max(2000),
  tags: z.array(z.string()),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null;
  existingSlugs: string[];
  onSave: (data: Partial<Job>) => void;
}

export const JobDialog = ({
  open,
  onOpenChange,
  job,
  existingSlugs,
  onSave,
}: JobDialogProps) => {
  const [tagInput, setTagInput] = useState("");
  
  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      slug: "",
      department: "",
      location: "",
      description: "",
      tags: [],
    },
  });

  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title,
        slug: job.slug,
        department: job.department || "",
        location: job.location || "",
        description: job.description || "",
        tags: job.tags || [],
      });
    } else {
      form.reset({
        title: "",
        slug: "",
        department: "",
        location: "",
        description: "",
        tags: [],
      });
    }
  }, [job, form]);

  const onSubmit = (data: JobFormData) => {
    // Validate unique slug
    if (!job && existingSlugs.includes(data.slug)) {
      form.setError("slug", { message: "Slug must be unique" });
      return;
    }
    if (job && data.slug !== job.slug && existingSlugs.includes(data.slug)) {
      form.setError("slug", { message: "Slug must be unique" });
      return;
    }

    onSave(data);
    onOpenChange(false);
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("tags");
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job" : "Create New Job"}</DialogTitle>
          <DialogDescription>
            {job
              ? "Update the job details below."
              : "Fill in the details to create a new job opening."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Senior Software Engineer"
                      onChange={(e) => {
                        field.onChange(e);
                        if (!job) {
                          const slug = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "");
                          form.setValue("slug", slug);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., senior-software-engineer" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Engineering" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Remote" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the role, responsibilities, and requirements..."
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={addTag} variant="secondary">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{job ? "Update" : "Create"} Job</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
