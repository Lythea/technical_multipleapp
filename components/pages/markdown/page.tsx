"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EditNotesModal from "@/components/pages/markdown/modal/EditNotes"; // Import Edit Modal
import Cookies from "js-cookie";
import supabase from "@/lib/supabaseClient";

type Note = {
  id: number;
  content: string;
  user_id?: string;
};

export default function Page() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for Edit Modal
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID from cookie and load notes
  useEffect(() => {
    const userIdFromCookies = Cookies.get("userId");
    setUserId(userIdFromCookies || null);

    if (userIdFromCookies) {
      fetchNotes(userIdFromCookies);
    }
  }, []);
  const handleAddNote = async () => {
    if (!userId || !currentNote.trim()) return;

    const newNote = {
      content: currentNote,
      user_id: userId,
      date: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("notes")
      .insert([newNote])
      .single();
    fetchNotes(userId);
    if (error) {
      console.error("Error adding note:", error);
    } else if (data) {
      setNotes([data, ...notes]); // Add new note to top
      setCurrentNote(""); // Clear textarea
    }
  };

  // Fetch notes from Supabase
  const fetchNotes = async (userId: string) => {
    console.log(userId);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error);
    } else if (data) {
      setNotes(data);
    }
  };

  // Handle deleting a note
  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting note:", error);
    } else {
      setNotes(notes.filter((note) => note.id !== id));
      if (editingId === id) {
        setCurrentNote("");
        setEditingId(null);
      }
    }
  };

  // Handle saving an edited note
  const handleEditSave = async (id: number, content: string) => {
    const { error } = await supabase
      .from("notes")
      .update({ content })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating note:", error);
    } else {
      // Update the note in the state
      setNotes(
        notes.map((note) => (note.id === id ? { ...note, content } : note))
      );
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Markdown Notes</h1>

      <div className="mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded"
          onClick={handleAddNote} // new handler
        >
          Add Note
        </button>

        <button
          className="bg-gray-500 text-white px-4 py-1 rounded ml-2"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? "Edit Mode" : "Preview Mode"}
        </button>
      </div>

      <div className="mb-4">
        <textarea
          className="w-full h-48 p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Write your markdown note here..."
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
        />
        {previewMode && (
          <div className="mt-4 p-6 border rounded-xl shadow-lg bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 prose prose-sm sm:prose lg:prose-lg">
            <div className="whitespace-pre-wrap break-words">
              <ReactMarkdown remarkPlugins={[[remarkGfm, { breaks: true }]]}>
                {currentNote}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <hr className="mb-4" />

      <h2 className="text-xl font-semibold mb-2">Your Notes</h2>
      <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
        {notes.length === 0 && <p className="text-gray-500">No notes yet.</p>}
        {notes.map((note) => (
          <div
            key={note.id}
            className="relative p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-xl shadow-lg border border-gray-200 max-w-none"
          >
            <div className="absolute top-0 right-0 flex">
              <button
                className="p-2 bg-yellow-500 text-white hover:bg-yellow-600 transition"
                onClick={() => {
                  setCurrentNote(note.content);
                  setEditingId(note.id);
                  setIsEditModalOpen(true);
                }}
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="p-2 bg-red-500 text-white hover:bg-red-600 transition"
                onClick={() => handleDelete(note.id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>

            <div className="prose prose-sm sm:prose lg:prose-lg">
              <pre className="whitespace-pre-wrap break-words">
                <ReactMarkdown remarkPlugins={[[remarkGfm, { breaks: true }]]}>
                  {note.content}
                </ReactMarkdown>
              </pre>
            </div>
          </div>
        ))}
      </div>

      <EditNotesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userId={userId}
        editingId={editingId}
        existingContent={currentNote}
        onSave={handleEditSave} // Pass handleEditSave as the save function
      />
    </div>
  );
}
