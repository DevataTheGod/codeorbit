import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  path: string;
}

const Breadcrumbs = ({ path }: BreadcrumbsProps) => {
  if (!path) return null;

  const parts = path.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <span className="text-foreground">codeorbit</span>
      {parts.map((part, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          <span className={index === parts.length - 1 ? "text-foreground font-medium" : ""}>
            {part}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;
