import { RichTextEditor as SharedRichTextEditor, type RichTextEditorProps } from "@osass/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RichTextEditor(props: RichTextEditorProps) {
  return <SharedRichTextEditor {...props} ButtonComponent={Button} InputComponent={Input} LabelComponent={Label} />;
}
