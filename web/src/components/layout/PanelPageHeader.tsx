type Props = {
  title: string;
  description?: string;
};

export function PanelPageHeader({ title, description }: Props) {
  return (
    <header>
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-sm text-[var(--muted)] mt-1">{description}</p>
      )}
    </header>
  );
}
