type InvalidShapeProps = {
  title: string;
  description: string;
};

export function InvalidQuestionShape({
  title,
  description,
}: InvalidShapeProps) {
  return (
    <div className="rounded-2xl border border-dashed border-destructive/50 bg-destructive/5 px-4 py-8 text-center">
      <p className="text-base font-medium text-destructive">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
