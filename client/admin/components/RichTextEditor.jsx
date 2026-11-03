"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write here...",
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange?.(editor.isEmpty ? "" : editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "rich-editor-content min-h-[130px] w-full px-4 py-3 text-sm leading-relaxed outline-none",
        "data-placeholder": placeholder,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const nextContent = value || "";

    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-[180px] animate-pulse rounded-xl border border-zinc-700 bg-zinc-950" />
    );
  }

  const buttonClass = (active) =>
    `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
      active
        ? "bg-emerald-600 text-white"
        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
    }`;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 p-2">
        <button
          type="button"
          title="Bold"
          aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive("bold"))}
        >
          B
        </button>

        <button
          type="button"
          title="Italic"
          aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive("italic"))}
        >
          <i>I</i>
        </button>

        <button
          type="button"
          title="Underline"
          aria-label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={buttonClass(editor.isActive("underline"))}
        >
          <u>U</u>
        </button>

        <span className="mx-1 h-6 border-l border-zinc-700" />

        <button
          type="button"
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive("bulletList"))}
        >
          • List
        </button>

        <button
          type="button"
          title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive("orderedList"))}
        >
          1. List
        </button>

        <button
          type="button"
          title="Paragraph"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={buttonClass(editor.isActive("paragraph"))}
        >
          Paragraph
        </button>

        <button
          type="button"
          title="Undo"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>

        <button
          type="button"
          title="Redo"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Redo
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}