import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

/** A labelled shadcn Select for a short list of options. `label` is the accessible name. */
export default function Dropdown({ value, onChange, options, label, className }: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(String(v))} items={options}>
      <SelectTrigger aria-label={label} className={cn("h-10 min-w-36 max-w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
