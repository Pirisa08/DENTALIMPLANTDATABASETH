import { useMantineTheme } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Example Mantine Tiptap usage for admin blog pages
export function MantineTiptapExample({ value, onChange }) {
  const theme = useMantineTheme();
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar>
        <RichTextEditor.Bold />
        <RichTextEditor.Italic />
        <RichTextEditor.Underline />
        <RichTextEditor.Strikethrough />
        <RichTextEditor.ClearFormatting />
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
