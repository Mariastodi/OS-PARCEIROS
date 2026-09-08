export default function GameHeader({
  onBack,
  subtitle,
}: {
  onBack: () => void;
  subtitle: string;
}) {
  return (
    <header className="topbar compact">
      <button className="brand" onClick={onBack} aria-label="Voltar aos jogos">
        <span className="brand-mark">P</span>
        <strong>Os Parceiros</strong>
      </button>
      <span className="step-label">{subtitle}</span>
    </header>
  );
}
