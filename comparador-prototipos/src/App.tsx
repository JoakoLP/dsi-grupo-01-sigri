import { useEffect, useState } from "react";

type Fidelity = "low" | "mid" | "high";

type PrototypeImage = {
  name: string;
  url: string;
  variant?: "base" | "modal";
  variantLabel?: string;
};

type Step = {
  id: number;
  name: string;
  description: string;
  images: Record<Fidelity, PrototypeImage[]>;
};

const fidelityColumns: Array<{
  id: Fidelity;
  number: string;
  title: string;
  caption: string;
  accent: string;
}> = [
  {
    id: "low",
    number: "01",
    title: "Baja fidelidad",
    caption: "Estructura y flujo",
    accent: "#A6D8CF",
  },
  {
    id: "mid",
    number: "02",
    title: "Media fidelidad",
    caption: "Jerarquía y contenido",
    accent: "#D8B4FE",
  },
  {
    id: "high",
    number: "03",
    title: "Alta fidelidad",
    caption: "Diseño visual final",
    accent: "#FDBA74",
  },
];

const stepDetails = [
  ["Acceso al sistema", "Bienvenida e inicio de sesión"],
  ["Dashboard", "Resumen general de incidentes"],
  ["Mapa GIS", "Visualización geográfica"],
  ["Zonas de riesgo", "Administración de áreas"],
  ["Sensores", "Gestión de dispositivos"],
  ["Refugios", "Puntos de asistencia"],
  ["Mediciones", "Registro y simulación"],
  ["Umbrales", "Configuración de parámetros"],
  ["Alertas", "Monitoreo de eventos"],
  ["Estadísticas", "Indicadores y reportes"],
];

const modalVariants = new Set([1, 2, 4, 5, 6, 8]);
const fidelityOrder: Fidelity[] = ["low", "mid", "high"];
const alternativeLabels: Record<number, string> = {
  1: "Aviso de error",
  2: "Sidebar contraido",
};

const extensionFor = (fidelity: Fidelity, step: number) => {
  if (fidelity === "mid") return "jpeg";
  if (fidelity === "high" && step === 1) return "jpeg";
  return "png";
};

const initialSteps: Step[] = stepDetails.map(([name, description], index) => {
  const step = index + 1;
  const number = String(step).padStart(2, "0");
  const lowExtension = extensionFor("low", step);
  const midExtension = extensionFor("mid", step);
  const highExtension = extensionFor("high", step);

  return {
    id: step,
    name,
    description,
    images: {
      low: [
        {
          name: `Baja fidelidad · ${number}`,
          url: `/prototypes/low/${number}.${lowExtension}`,
          variant: "base",
        },
      ],
      mid: [
        {
          name: `Media fidelidad · ${number}`,
          url: `/prototypes/mid/${number}.${midExtension}`,
          variant: "base",
        },
      ],
      high: [
        {
          name: `Alta fidelidad · ${number}`,
          url: `/prototypes/high/${number}.${highExtension}`,
          variant: "base",
        },
        ...(modalVariants.has(step)
          ? [
              {
                name: `Alta fidelidad · ${number}a · ${alternativeLabels[step] ?? "Modal abierto"}`,
                url: `/prototypes/high/${number}a.${highExtension}`,
                variant: "modal" as const,
                variantLabel: alternativeLabels[step] ?? "Modal abierto",
              },
            ]
          : []),
      ],
    },
  };
});

function Icon({ name, size = 18 }: { name: "grid" | "arrow" | "expand" | "close"; size?: number }) {
  const paths = {
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    expand: (
      <>
        <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
        <path d="m3 8 5-5m8 0 5 5M3 16l5 5m8 0 5-5" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function PrototypeCell({
  images,
  onOpen,
}: {
  images: PrototypeImage[];
  onOpen: (variantIndex: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="prototype-viewer">
      {images.length > 1 && (
        <div className="variant-switcher" aria-label="Variantes de la captura">
          {images.map((image, index) => (
            <button
              className={index === activeIndex ? "is-active" : ""}
              type="button"
              onClick={() => setActiveIndex(index)}
              key={image.url}
            >
              {image.variant === "modal" ? image.variantLabel : "Vista base"}
            </button>
          ))}
        </div>
      )}
      <button
        className="prototype-image"
        type="button"
        onClick={() => onOpen(activeIndex)}
        aria-label={`Ampliar ${activeImage.name}`}
      >
        <img src={activeImage.url} alt={activeImage.name} />
        <span className="expand-label">
          <Icon name="expand" size={15} />
          Ampliar
        </span>
        {activeImage.variant === "modal" && <span className="modal-badge">Estado alternativo</span>}
      </button>
    </div>
  );
}

export default function App() {
  const [lightbox, setLightbox] = useState<{
    stepIndex: number;
    fidelityIndex: number;
    variantIndex: number;
  } | null>(null);

  const lightboxImages = lightbox
    ? initialSteps[lightbox.stepIndex].images[fidelityOrder[lightbox.fidelityIndex]]
    : [];
  const lightboxImage = lightbox ? lightboxImages[lightbox.variantIndex] : null;

  const moveFidelity = (direction: -1 | 1) => {
    setLightbox((current) => {
      if (!current) return null;
      const fidelityIndex = Math.min(
        fidelityOrder.length - 1,
        Math.max(0, current.fidelityIndex + direction),
      );
      if (fidelityIndex === current.fidelityIndex) return current;
      return { ...current, fidelityIndex, variantIndex: 0 };
    });
  };

  const moveModule = (direction: -1 | 1) => {
    setLightbox((current) => {
      if (!current) return null;
      const stepIndex = Math.min(
        initialSteps.length - 1,
        Math.max(0, current.stepIndex + direction),
      );
      if (stepIndex === current.stepIndex) return current;
      const images = initialSteps[stepIndex].images[fidelityOrder[current.fidelityIndex]];
      return {
        ...current,
        stepIndex,
        variantIndex: Math.min(current.variantIndex, images.length - 1),
      };
    });
  };

  const toggleVariant = () => {
    setLightbox((current) => {
      if (!current) return null;
      const images = initialSteps[current.stepIndex].images[fidelityOrder[current.fidelityIndex]];
      if (images.length < 2) return current;
      return { ...current, variantIndex: current.variantIndex === 0 ? 1 : 0 };
    });
  };

  useEffect(() => {
    if (!lightbox) return;
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft") moveFidelity(-1);
      if (event.key === "ArrowRight") moveFidelity(1);
      if (event.key === "ArrowUp") moveModule(-1);
      if (event.key === "ArrowDown") moveModule(1);
      if (event.code === "Space") toggleVariant();
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) ||
        event.code === "Space"
      ) {
        event.preventDefault();
      }
    };
    document.body.classList.add("lightbox-open");
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [lightbox]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Archivo de prototipos">
          <span className="brand-mark">
            <Icon name="grid" size={18} />
          </span>
          <span>Archivo de prototipos</span>
          <span className="group-badge">Grupo 01</span>
        </a>
        <div className="topbar-meta">
          <span className="status-dot" />
          SIGRI · Evolución de diseño
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">Sistema de Gestión de Riesgo de Inundaciones</p>
          <h1>Comparativa de prototipos</h1>
          <p className="lede">
            Evolución de los diez módulos del sistema, desde la definición inicial del flujo hasta
            la interfaz visual final.
          </p>
        </div>
        <div className="capture-summary">
          <strong>36</strong>
          <span>capturas organizadas</span>
        </div>
      </section>

      <section className="board-section" aria-label="Tabla comparativa">
        <div className="board-hint">
          <span>Comparación horizontal</span>
          <Icon name="arrow" size={16} />
          <span>Desplázate para ver las fidelidades</span>
        </div>
        <div className="board-scroll">
          <div className="comparison-board">
            <div className="board-corner">
              <span>Recorrido</span>
              <strong>Módulos del sistema</strong>
            </div>
            {fidelityColumns.map((column) => (
              <div className="column-head" key={column.id}>
                <span className="column-number" style={{ backgroundColor: column.accent }}>
                  {column.number}
                </span>
                <span>
                  <strong>{column.title}</strong>
                  <small>{column.caption}</small>
                </span>
              </div>
            ))}

            {initialSteps.map((step, stepIndex) => (
              <div className="board-row" key={step.id}>
                <div className="step-cell">
                  <span className="step-number">{String(stepIndex + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{step.name}</strong>
                    <p>{step.description}</p>
                  </div>
                </div>
                {fidelityColumns.map((column, fidelityIndex) => (
                  <div className="prototype-cell" key={column.id}>
                    <PrototypeCell
                      images={step.images[column.id]}
                      onOpen={(variantIndex) =>
                        setLightbox({ stepIndex, fidelityIndex, variantIndex })
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <span>10 módulos en el recorrido</span>
        <span className="footer-line" />
        <span>6 estados alternativos disponibles</span>
        <span className="footer-line" />
        <span>Fuente: archivo de prototipos SIGRI</span>
      </footer>

      {lightboxImage && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightboxImage.name}>
          <button
            className="lightbox-backdrop"
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Cerrar vista ampliada"
          />
          <div className="lightbox-content">
            <div className="lightbox-bar">
              <span className="lightbox-title">
                <small>Vista ampliada</small>
                <strong>{lightboxImage.name}</strong>
              </span>
              <div className="lightbox-controls" aria-label="Controles de navegación">
                <div className="control-group">
                  <span>Fidelidad</span>
                  <button
                    type="button"
                    onClick={() => moveFidelity(-1)}
                    disabled={lightbox!.fidelityIndex === 0}
                    aria-label="Fidelidad anterior"
                  >
                    <kbd>←</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFidelity(1)}
                    disabled={lightbox!.fidelityIndex === fidelityOrder.length - 1}
                    aria-label="Fidelidad siguiente"
                  >
                    <kbd>→</kbd>
                  </button>
                </div>
                <div className="control-group">
                  <span>Módulo</span>
                  <button
                    type="button"
                    onClick={() => moveModule(-1)}
                    disabled={lightbox!.stepIndex === 0}
                    aria-label="Módulo anterior"
                  >
                    <kbd>↑</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveModule(1)}
                    disabled={lightbox!.stepIndex === initialSteps.length - 1}
                    aria-label="Módulo siguiente"
                  >
                    <kbd>↓</kbd>
                  </button>
                </div>
                <button
                  className="variant-control"
                  type="button"
                  onClick={toggleVariant}
                  disabled={lightboxImages.length < 2}
                  aria-label="Alternar vista"
                >
                  <kbd>Espacio</kbd>
                  <span>
                    {lightboxImages.length > 1
                      ? lightboxImage.variant === "modal"
                        ? "Volver a vista base"
                        : lightboxImages[1].variantLabel
                      : "Sin alternativa"}
                  </span>
                </button>
              </div>
              <button
                className="lightbox-close"
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Cerrar"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <img src={lightboxImage.url} alt={lightboxImage.name} />
          </div>
        </div>
      )}
    </main>
  );
}
