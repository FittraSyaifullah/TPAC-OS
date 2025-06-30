import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <div className="text-center py-12 border-2 border-dashed rounded-lg">
      <div className="mx-auto bg-muted p-3 rounded-full w-fit mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );
};