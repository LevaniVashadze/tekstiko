"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

interface Text {
  id: string;
  referenceID: string;
  text: string;
  correctedText: string;
  dateUploaded: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [texts, setTexts] = useState<Text[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingText, setEditingText] = useState<Text | null>(null);
  const [formData, setFormData] = useState({
    referenceID: "",
    text: "",
    correctedText: "",
  });

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/admin/login");
      return;
    }

    if (status === "authenticated") {
      loadTexts();
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not authenticated, don't render the admin content
  if (status === "unauthenticated") {
    return null;
  }

  const loadTexts = async () => {
    try {
      const response = await fetch("/api/admin/texts");
      if (response.ok) {
        const data = await response.json();
        setTexts(data);
      } else {
        toast.error("Failed to load texts");
      }
    } catch (error) {
      toast.error("Failed to load texts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.referenceID || !formData.text || !formData.correctedText) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingText
        ? `/api/admin/texts/${editingText.id}`
        : "/api/admin/texts";
      const method = editingText ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingText
            ? "Text updated successfully!"
            : "Text uploaded successfully!"
        );
        setFormData({
          referenceID: "",
          text: "",
          correctedText: "",
        });
        setEditingText(null);
        loadTexts();
      } else {
        const error = await response.json();
        toast.error(
          error.error ||
            (editingText ? "Failed to update text" : "Failed to upload text")
        );
      }
    } catch (error) {
      toast.error(
        editingText ? "Failed to update text" : "Failed to upload text"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (text: Text) => {
    setEditingText(text);
    setFormData({
      referenceID: text.referenceID,
      text: text.text,
      correctedText: text.correctedText,
    });
  };

  const handleCancelEdit = () => {
    setEditingText(null);
    setFormData({
      referenceID: "",
      text: "",
      correctedText: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this text?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/texts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Text deleted successfully!");
        loadTexts();
      } else {
        toast.error("Failed to delete text");
      }
    } catch (error) {
      toast.error("Failed to delete text");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ტექსტიკო - Admin Panel
            </h1>
            <p className="text-gray-600">Manage Georgian grammar texts</p>
            {session?.user?.email && (
              <p className="text-sm text-gray-500">
                Logged in as: {session.user.email}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Back to Training</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingText
                  ? `Edit Text: ${editingText.referenceID}`
                  : "Upload New Text"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="referenceID">Reference ID</Label>
                  <Input
                    id="referenceID"
                    type="text"
                    placeholder="e.g., 2022v3"
                    value={formData.referenceID}
                    onChange={(e) =>
                      setFormData({ ...formData, referenceID: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="text">Original Text (with errors)</Label>
                  <Textarea
                    id="text"
                    placeholder="Enter the Georgian text with grammatical errors..."
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    className="min-h-32"
                  />
                </div>

                <div>
                  <Label htmlFor="correctedText">Corrected Text</Label>
                  <Textarea
                    id="correctedText"
                    placeholder="Enter the corrected version of the text..."
                    value={formData.correctedText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correctedText: e.target.value,
                      })
                    }
                    className="min-h-32"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting
                      ? editingText
                        ? "Updating..."
                        : "Uploading..."
                      : editingText
                      ? "Update Text"
                      : "Upload Text"}
                  </Button>
                  {editingText && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Texts List */}
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Texts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-gray-600">Loading texts...</p>
              ) : texts.length === 0 ? (
                <p className="text-gray-600">No texts uploaded yet.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {texts.map((text) => (
                    <div
                      key={text.id}
                      className="p-4 border rounded-lg bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-sm text-gray-600">
                          {text.referenceID}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(text)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(text.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800 mb-2 line-clamp-3">
                        {text.text.substring(0, 100)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded:{" "}
                        {new Date(text.dateUploaded).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
