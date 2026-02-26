import type { CSSProperties } from "react";
import { useTheme } from "../hooks/useTheme";
import CAComponent from "../components/CAComponent";

const StylingGuideline = () => {
  const theme = useTheme();

  return (
    <div className="styling-guideline">
      <h1>Styling Guidelines</h1>
      <p>This page showcases all available styles from theme.ts</p>

      <section className="sg-section">
        <h2>Colors</h2>
        <div className="sg-grid sg-grid--colors">
          {Object.entries(theme.colors || {}).map(([key, value]) => (
            <div key={key}>
              <div
                style={{
                  backgroundColor: String(value),
                }}
                className="sg-swatch"
              />
              <p className="sg-label">{key}</p>
              <code className="sg-code">{String(value)}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="sg-section">
        <h2>Typography</h2>
        {theme.typography &&
          Object.entries(theme.typography).map(([key, style]) => (
            <div key={key} className="sg-typo-item">
              <p style={style as CSSProperties}>
                {key} - The quick brown fox jumps over the lazy dog
              </p>
              <code className="sg-code">{JSON.stringify(style)}</code>
            </div>
          ))}
      </section>

      <section className="sg-section">
        <h2>Spacing</h2>
        {theme.spacing &&
          Object.entries(theme.spacing).map(([key, value]) => (
            <div key={key} className="sg-typo-item">
              <div className="sg-spacing-row">
                <div
                  style={{
                    width: String(value),
                  }}
                  className="sg-spacing-bar"
                />
                <span>
                  {key}: {String(value)}
                </span>
              </div>
            </div>
          ))}
      </section>

      <section>
        <h2>Shadows</h2>
        <div className="sg-grid sg-grid--shadows">
          {theme.shadows &&
            Object.entries(theme.shadows).map(([key, value]) => (
              <div
                key={key}
                style={{
                  boxShadow: String(value),
                }}
                className="sg-shadow-card"
              >
                <p style={{ margin: "0" }}>{key}</p>
                <code className="sg-code">{String(value)}</code>
              </div>
            ))}
        </div>
      </section>

        {/* Layer + Component Pairing Section */}
        <section className="sg-section">
          <h2>Layer + Component Pairing</h2>
          <div
            style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: theme.spacing?.lg || "1.5rem",
              }}
            >
              {[
            { layer: "ApplicationBusinessRules" as const, label: "Application Business Rules", keyword: "UseCases" },
            { layer: "EnterpriseBusinessRules" as const, label: "Enterprise Business Rules", keyword: "Entities" },
            { layer: "InterfaceAdapters" as const, label: "Interface Adapters", keyword: "Adapters" },
            { layer: "Frameworks" as const, label: "Frameworks and Drivers", keyword: "Drivers" },
              ].map(({ layer, label, keyword }) => (
            <div
              key={label}
              style={{
                backgroundColor: theme.colors?.[`layer${keyword.replace(/\s+/g, "")}` as keyof typeof theme.colors],
                borderRadius: theme.spacing?.sm || "8px",
                padding: theme.spacing?.md || "1.5rem",
                minHeight: "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${theme.colors?.border}`,
              }}
            >
              <CAComponent title={label} variant={layer} />          
            </div>
              ))}
          </div>
        </section>
      <section className="sg-section">
        <h2>Syntax Highlighting</h2>
        <div className="sg-code-example">
          <pre style={{ backgroundColor: theme.colors?.background, color: theme.colors?.text, padding: theme.spacing?.md, borderRadius: theme.spacing?.sm, overflow: "auto" }}>
        <code>
          <span style={{ color: theme.colors?.textEntities }}>public</span>
          {" class "}
          <span style={{ color: theme.colors?.textAdapters }}>HelloWorld</span>
          {" {\n    "}
          <span style={{ color: theme.colors?.textEntities }}>public static void</span>
          {" main("}
          <span style={{ color: theme.colors?.textDrivers }}>String</span>
          {`[] args) {\n        `}
          <span style={{ color: theme.colors?.textUseCases }}>System</span>
          {".out.println("}
          <span style={{ color: theme.colors?.textEntities }}>"Hello, World!"</span>
          {"); "}
          <span style={{ color: theme.colors?.text }}>// Prints "Hello, World!" to the console</span>
          {"\n    }\n}"}
        </code>
          </pre>
        </div>
      </section>
    </div>
  );
};

export default StylingGuideline;
