"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { useState, useCallback, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link2,
  ImageIcon,
  Info,
  AlertTriangle,
  Video,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { extractClaapId } from "@/lib/utils";

import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import BoldExt from "@tiptap/extension-bold";
import ItalicExt from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import CodeInline from "@tiptap/extension-code";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import History from "@tiptap/extension-history";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import HardBreak from "@tiptap/extension-hard-break";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

// ─── Helpers ───────────────────────────────────────────────────────────────

async function uploadImageFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url as string;
  } catch {
    return null;
  }
}

// ─── Custom Claap Video node ────────────────────────────────────────────────

const ClaapVideo = Node.create({
  name: "claapVideo",
  group: "block",
  atom: true,
  addAttributes() {
    return { clipId: { default: null } };
  },
  parseHTML() {
    return [{
      tag: "div[data-claap-id]",
      getAttrs: (el) => ({ clipId: (el as HTMLElement).getAttribute("data-claap-id") }),
    }];
  },
  renderHTML({ HTMLAttributes }) {
    const clipId = HTMLAttributes.clipId;
    return [
      "div",
      {
        class: "claap-embed-wrapper",
        style: "position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0;",
        "data-claap-id": clipId,
      },
      ["iframe", {
        src: `https://app.claap.io/embed/${clipId}`,
        style: "position:absolute;top:0;left:0;width:100%;height:100%;border:none;",
        allowfullscreen: "true",
        allow: "autoplay; fullscreen",
      }],
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const wrapper = document.createElement("div");
      wrapper.style.cssText = [
        "position:relative",
        "padding-bottom:56.25%",
        "height:0",
        "overflow:hidden",
        "border-radius:12px",
        "margin:16px 0",
        "background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",
        "border:1px solid rgba(139,92,246,0.3)",
        "cursor:default",
      ].join(";");
      wrapper.setAttribute("data-claap-id", node.attrs.clipId);
      wrapper.setAttribute("contenteditable", "false");

      const inner = document.createElement("div");
      inner.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;";

      const icon = document.createElement("div");
      icon.style.cssText = "width:48px;height:48px;border-radius:50%;background:rgba(139,92,246,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;";
      icon.textContent = "🎬";

      const label = document.createElement("div");
      label.style.cssText = "color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;letter-spacing:0.01em;";
      label.textContent = "Claap — cliquez sur aperçu pour lire";

      const id = document.createElement("div");
      id.style.cssText = "color:rgba(255,255,255,0.35);font-size:11px;font-family:monospace;";
      id.textContent = node.attrs.clipId;

      inner.appendChild(icon);
      inner.appendChild(label);
      inner.appendChild(id);
      wrapper.appendChild(inner);

      return { dom: wrapper };
    };
  },
});

// ─── Custom Callout block ───────────────────────────────────────────────────

const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "inline*",
  addAttributes() {
    return { type: { default: "info" } };
  },
  parseHTML() {
    return [{ tag: "div[data-callout]", getAttrs: (el) => ({ type: (el as HTMLElement).getAttribute("data-callout") }) }];
  },
  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes.type;
    return [
      "div",
      { class: `callout-${type}`, "data-callout": type },
      ["span", { class: "callout-icon" }, type === "info" ? "ℹ️" : "⚠️"],
      ["span", { class: "callout-content" }, 0],
    ];
  },
});

// ─── Paste & Drop image plugin ──────────────────────────────────────────────

function createImagePasteDropPlugin(
  onUpload: (file: File, pos?: number) => void
) {
  return new Plugin({
    key: new PluginKey("imagePasteDrop"),
    props: {
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItems = items.filter((i) => i.type.startsWith("image/"));
        if (imageItems.length === 0) return false;

        event.preventDefault();
        imageItems.forEach((item) => {
          const file = item.getAsFile();
          if (file) onUpload(file, view.state.selection.anchor);
        });
        return true;
      },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (files.length === 0) return false;

        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        files.forEach((file) => onUpload(file, pos));
        return true;
      },
    },
  });
}

// ─── Editor component ───────────────────────────────────────────────────────

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded hover:bg-muted transition text-muted-foreground hover:text-foreground",
        active && "bg-brand-100 dark:bg-brand-500/20 text-brand-500"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [claapModalOpen, setClaapModalOpen] = useState(false);
  const [claapUrl, setClaapUrl] = useState("");
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload helper used by both toolbar button, paste, and drop
  const uploadAndInsert = useCallback(
    async (file: File, pos?: number) => {
      setUploading(true);
      const url = await uploadImageFile(file);
      setUploading(false);
      if (!url || !editorRef.current) return;
      const ed = editorRef.current;

      if (pos !== undefined) {
        // Insert at the dropped/pasted position
        ed.chain()
          .focus()
          .insertContentAt(pos, [
            { type: "image", attrs: { src: url, alt: file.name } },
            { type: "paragraph" },
          ])
          .run();
      } else {
        // Insert at cursor, then add paragraph so user can continue typing
        ed.chain()
          .focus()
          .setImage({ src: url, alt: file.name })
          .insertContent({ type: "paragraph" })
          .run();
      }
    },
    [] // editorRef is a stable ref, no deps needed
  );

  // We store editor in a ref so uploadAndInsert can access it without stale closure
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const editor = useEditor({
    extensions: [
      Document, Paragraph, Text, BoldExt, ItalicExt, Strike, Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList, OrderedList, ListItem, Blockquote,
      CodeBlock, CodeInline, HorizontalRule, History,
      Dropcursor.configure({ color: "#8b5cf6", width: 2 }),
      Gapcursor, HardBreak,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
      ClaapVideo,
      Callout,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "outline-none min-h-[400px] px-1" },
      // Expose the plugin for paste/drop
    },
    onCreate({ editor: ed }) {
      // Register paste/drop plugin
      (editorRef as React.MutableRefObject<typeof ed>).current = ed;
      const plugin = createImagePasteDropPlugin((file, pos) => uploadAndInsert(file, pos));
      ed.registerPlugin(plugin);
    },
  });

  // Keep editorRef in sync
  if (editor && editorRef.current !== editor) {
    (editorRef as React.MutableRefObject<typeof editor>).current = editor;
  }

  // Insert Claap video at cursor, then add a paragraph after
  const insertClaap = useCallback(() => {
    if (!editor || !claapUrl.trim()) return;
    const clipId = extractClaapId(claapUrl) || claapUrl.trim();
    editor
      .chain()
      .focus()
      .insertContent([
        { type: "claapVideo", attrs: { clipId } },
        { type: "paragraph" },
      ])
      .run();
    setClaapModalOpen(false);
    setClaapUrl("");
  }, [editor, claapUrl]);

  const insertLink = useCallback(() => {
    if (!editor || !linkUrl.trim()) return;
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkModalOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  // Toolbar image button (file picker)
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await uploadAndInsert(file);
      e.target.value = "";
    },
    [uploadAndInsert]
  );

  if (!editor) {
    return (
      <div className="border border-border rounded-xl h-[400px] flex items-center justify-center text-muted-foreground text-sm">
        Chargement...
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annuler (Ctrl+Z)">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir (Ctrl+Y)">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Gras (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italique (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Souligné (Ctrl+U)">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Barré">
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Titre H1">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Titre H2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Titre H3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Liste à puces">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Liste numérotée">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citation">
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Bloc de code">
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur">
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => { setLinkUrl(editor.getAttributes("link").href || ""); setLinkModalOpen(true); }}
          active={editor.isActive("link")}
          title="Insérer un lien"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        {/* Image upload button */}
        <label
          title="Insérer une image (ou faites Ctrl+V / glisser-déposer)"
          className={cn(
            "p-1.5 rounded hover:bg-muted transition text-muted-foreground hover:text-foreground cursor-pointer",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          <ImageIcon className="w-4 h-4" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
        <Divider />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().insertContent([
              { type: "callout", attrs: { type: "info" }, content: [{ type: "text", text: "Note d'information..." }] },
              { type: "paragraph" },
            ]).run()
          }
          title="Callout info (bleu)"
        >
          <Info className="w-4 h-4 text-blue-500" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().insertContent([
              { type: "callout", attrs: { type: "warning" }, content: [{ type: "text", text: "Avertissement..." }] },
              { type: "paragraph" },
            ]).run()
          }
          title="Callout avertissement (orange)"
        >
          <AlertTriangle className="w-4 h-4 text-orange-500" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setClaapModalOpen(true)} title="Insérer une vidéo Claap">
          <Video className="w-4 h-4 text-purple-500" />
        </ToolbarButton>
      </div>

      {/* Upload progress indicator */}
      {uploading && (
        <div className="px-4 py-2 bg-brand-500/10 border-b border-brand-500/20 text-brand-500 text-xs flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          Envoi de l&apos;image en cours…
        </div>
      )}

      {/* Content area — clicking anywhere in the padded area focuses editor */}
      <div
        className="p-4 cursor-text"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Claap modal */}
      {claapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-base font-semibold text-foreground mb-1">Insérer une vidéo Claap</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Collez l&apos;URL Claap (ex: https://app.claap.io/workspace/titre-c-xxxxx)
            </p>
            <input
              type="url"
              value={claapUrl}
              onChange={(e) => setClaapUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
              placeholder="https://app.claap.io/..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && insertClaap()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setClaapModalOpen(false); setClaapUrl(""); }}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition"
              >
                Annuler
              </button>
              <button
                onClick={insertClaap}
                className="px-4 py-2 text-sm rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition"
              >
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-base font-semibold text-foreground mb-4">Insérer un lien</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
              placeholder="https://..."
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && insertLink()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setLinkModalOpen(false); setLinkUrl(""); }}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition"
              >
                Annuler
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 text-sm rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition"
              >
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
