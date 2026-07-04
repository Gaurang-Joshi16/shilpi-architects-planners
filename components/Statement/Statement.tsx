interface StatementProps {
  text: string;
  align?: "left" | "right";
  paddingTop?: string;
  paddingBottom?: string;
}

export default function Statement({
  text,
  align = "left",
  paddingTop,
  paddingBottom,
}: StatementProps) {
  return (
    <section
      className="statement-section"
      data-reveal
      style={{
        paddingTop: paddingTop,
        paddingBottom: paddingBottom,
      }}
    >
      <h2
        className="statement-text"
        style={{
          textAlign: align,
          marginLeft: align === "right" ? "auto" : undefined,
        }}
      >
        {text}
      </h2>
    </section>
  );
}
