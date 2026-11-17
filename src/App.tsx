import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { products, newProducts, image, cutout, countLabel, type Product } from "./products";
import { trackVisitor } from "./utils/telegramTracker";

type IconName =
  | "search"
  | "bag"
  | "menu"
  | "close"
  | "arrow"
  | "left"
  | "right"
  | "plus"
  | "minus"
  | "rotate"
  | "check"
  | "globe"
  | "telegram"
  | "tiktok"
  | "facebook";
function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
    menu: (
      <>
        <path d="M4 8h16M4 16h16" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    left: <path d="m14 6-6 6 6 6" />,
    right: <path d="m10 6 6 6-6 6" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    rotate: (
      <>
        <path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    telegram: (
      <path
        fill="currentColor"
        stroke="none"
        d="M21.4 3.6 18.2 20c-.2 1-1 1.2-1.8.6l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.3L5.8 13.4 1 11.9c-1-.3-1-1 .2-1.5L20 3.1c.9-.3 1.6.2 1.4.5Z"
      />
    ),
    tiktok: (
      <path
        fill="currentColor"
        stroke="none"
        d="M16 2h-4v13a3 3 0 1 1-3-3v-4a7 7 0 1 0 7 7V8a10 10 0 0 0 6 2V6a6 6 0 0 1-6-4Z"
      />
    ),
    facebook: (
      <path
        fill="currentColor"
        stroke="none"
        d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4A25 25 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9Z"
      />
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Wordmark() {
  return (
    <img
      className="brand-logo"
      src="/images/brand/yak-logo.png"
      alt="YAK"
      width={800}
      height={499}
    />
  );
}

type BagItem = { product: Product; size: string; quantity: number };
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const money = (amount: number) => `$${amount.toFixed(2)}`;

function Hanger() {
  return (
    <svg className="hanger" viewBox="0 0 180 82" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="metal" x1="0" x2="0" y2="1">
          <stop stopColor="#666668" />
          <stop offset=".45" stopColor="#fdfcff" />
          <stop offset="1" stopColor="#85818b" />
        </linearGradient>
      </defs>
      <path
        d="M90 29V15c0-13 15-15 17-5 1 5-2 8-5 8M90 29 23 67c-5 3-3 7 3 7h128c6 0 8-4 3-7L90 29Z"
        stroke="url(#metal)"
        strokeWidth="2.8"
      />
    </svg>
  );
}

function Dialog({
  children,
  title,
  close,
  drawer = false,
}: {
  children: ReactNode;
  title: string;
  close: () => void;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    function keydown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const list = ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input, [tabindex="0"]',
        );
        if (!list?.length) return;
        const first = list[0],
          last = list[list.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [close]);
  return (
    <div className={`overlay ${drawer ? "drawer-overlay" : ""}`} onClick={close}>
      <div
        className={`dialog ${drawer ? "drawer" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="icon-button dialog-close" aria-label="Close dialog" onClick={close}>
          <Icon name="close" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState(() => products.indexOf(newProducts[0]));
  const [arrivalsBack, setArrivalsBack] = useState(false);
  const [turned, setTurned] = useState<number | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [back, setBack] = useState(false);
  const [size, setSize] = useState("M");
  const [sizeGuide, setSizeGuide] = useState(false);
  const [bag, setBag] = useState<BagItem[]>([]);
  const [panel, setPanel] = useState<"bag" | "search" | "menu" | null>(null);
  const [zoom, setZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [look, setLook] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const userInteractedTimeout = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    distance: number;
    width: number;
    index: number;
    axis: "horizontal" | "vertical" | null;
  } | null>(null);
  const suppressRackClick = useRef(false);
  const pagination = useRef<HTMLDivElement>(null);
  const bagCount = bag.reduce((n, item) => n + item.quantity, 0);
  const total = bag.reduce((n, item) => n + item.quantity * item.product.price, 0);
  const close = useRef(() => {
    setDetail(null);
    setPanel(null);
    setZoom(false);
    setZoomLevel(1);
    if (window.location.search.includes("product=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }).current;

  // Track visitor and notify Telegram bot
  useEffect(() => {
    trackVisitor();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product");
    const hash = window.location.hash;
    const hashProduct = hash.startsWith("#product-") ? hash.replace("#product-", "") : null;
    const targetId = productId || hashProduct;
    if (targetId) {
      const found = products.find((p) => p.id === targetId);
      if (found) {
        setDetail(found);
      }
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const track = pagination.current;
    const selected = track?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!track || !selected) return;
    const centerSelected = () =>
      track.scrollTo({
        left: selected.offsetLeft - (track.clientWidth - selected.offsetWidth) / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    centerSelected();
    window.addEventListener("resize", centerSelected);
    return () => window.removeEventListener("resize", centerSelected);
  }, [active]);

  function pauseAutoSlideTemporarily() {
    setUserInteracted(true);
    if (userInteractedTimeout.current) window.clearTimeout(userInteractedTimeout.current);
    userInteractedTimeout.current = window.setTimeout(() => {
      setUserInteracted(false);
    }, 5000);
  }

  useEffect(() => {
    if (
      isDragging ||
      isHovered ||
      userInteracted ||
      detail !== null ||
      panel !== null ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setTurned(null);
      setActive((current) => (current + 1) % products.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [isDragging, isHovered, userInteracted, detail, panel]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function openProduct(product: Product) {
    setBack(false);
    setSizeGuide(false);
    setZoom(false);
    setZoomLevel(1);
    setSize("M");
    setPanel(null);
    setDetail(product);
    window.history.replaceState(null, "", "?product=" + product.id);
  }

  async function buyViaTelegram(product: Product, chosenSize = size) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const productUrl = origin + pathname + "?product=" + product.id;
    const frontImageUrl = origin + "/images/jerseys/" + product.id + "-front.png";
    const backImageUrl = origin + "/images/jerseys/" + product.id + "-back.png";

    const lines = [
      "សួស្តីបង! ខ្ញុំចង់កុម្ម៉ង់ទិញអាវ៖",
      "👕 ម៉ូដ៖ " + product.name,
      "🎨 ពណ៌៖ " + product.color,
      "📏 ទំហំ (Size)៖ " + chosenSize,
      "💵 តម្លៃ៖ " + money(product.price),
      "",
      "🖼️ រូបភាពអាវ៖",
      "• ខាងមុខ៖ " + frontImageUrl,
      "• ខាងក្រោយ៖ " + backImageUrl,
      "",
      "🔗 លីងអាវលើវេបសាយ៖ " + productUrl,
    ];
    const message = lines.join("\n");

    try {
      const response = await fetch("/images/jerseys/" + product.id + "-front.png");
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setToast("បាន Copy រូបអាវ! អ្នកអាចចុច Paste (Ctrl+V) ផ្ញើក្នុង Telegram ភ្លាមបាន 👕");
    } catch {
      // Ignore if clipboard API is restricted
    }

    const telegramUrl = "https://t.me/Phochaifong?text=" + encodeURIComponent(message);
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
  }

  function checkoutBagViaTelegram() {
    if (!bag.length) return;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const itemsList = bag.map(function(item, index) {
      return (
        String(index + 1) + ". " + item.product.name + " (" + item.product.color + ")\n" +
        "   - ទំហំ: " + item.size + " x " + item.quantity + "\n" +
        "   - តម្លៃ: " + money(item.quantity * item.product.price) + "\n" +
        "   - 🖼️ រូបភាព: " + origin + "/images/jerseys/" + item.product.id + "-front.png\n" +
        "   - 🔗 Link: " + origin + pathname + "?product=" + item.product.id
      );
    });
    const lines = [
      "សួស្តីបង! ខ្ញុំចង់កុម្ម៉ង់ទិញអាវក្នុងកន្ត្រក៖",
      "",
      ...itemsList,
      "",
      "====================",
      "💰 សរុបទាំងអស់៖ " + money(total),
    ];
    const message = lines.join("\n");

    const telegramUrl = "https://t.me/Phochaifong?text=" + encodeURIComponent(message);
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
  }
  function addToBag(product: Product, chosenSize = size) {
    setBag((items) => {
      const found = items.find(
        (item) => item.product.id === product.id && item.size === chosenSize,
      );
      return found
        ? items.map((item) => (item === found ? { ...item, quantity: item.quantity + 1 } : item))
        : [...items, { product, size: chosenSize, quantity: 1 }];
    });
    setToast(`${product.color} · ${chosenSize} added to your bag`);
  }
  function move(direction: number) {
    pauseAutoSlideTemporarily();
    setTurned(null);
    setActive((current) => (current + direction + products.length) % products.length);
  }
  function selectPiece(index: number) {
    if (suppressRackClick.current) return;
    pauseAutoSlideTemporarily();
    if (active !== index) {
      setActive(index);
      setTurned(index);
    } else if (turned !== index) setTurned(index);
    else openProduct(products[index]);
  }
  function navigate(id: string) {
    close();
    window.setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }
  const looks = [
    {
      title: "The Family Booyah",
      subtitle: "Black, gold, and artwork that speaks for itself.",
      color: 0,
      label: "01 / THE FAMILY COLLECTION",
    },
    {
      title: "Cafe Spean Music",
      subtitle: "Sky-blue tones. A story on every side.",
      color: 2,
      label: "02 / THE MUSIC COLLECTION",
    },
    {
      title: "The VK Music",
      subtitle: "Amber artwork with a darker edge.",
      color: 4,
      label: "03 / THE GRAPHIC COLLECTION",
    },
  ];

  return (
    <>
      <div className="announcement" />
      <header className="header">
        <a
          className="brand"
          href="#"
          aria-label="Home"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Wordmark />
        </a>
        <nav aria-label="Main navigation">
          <a href="#collection">
            New Collection <span className="nav-dot" />
          </a>
          <a href="#looks">Shop the Look</a>
          <a href="#story">Our Story</a>
        </nav>
        <div className="header-actions">
          <img
            className="cambodia-flag"
            src="/images/flags/cambodia.svg"
            alt="Cambodia"
            title="Cambodia"
            width={28}
            height={18}
          />
          <button
            className="icon-button"
            aria-label="Search collection"
            onClick={() => setPanel("search")}
          >
            <Icon name="search" />
          </button>
          <button
            className="icon-button bag-button"
            aria-label={`Open shopping bag, ${bagCount} items`}
            onClick={() => setPanel("bag")}
          >
            <Icon name="bag" />
            <span className="bag-count">{bagCount}</span>
          </button>
          <button
            className="icon-button menu-button"
            aria-label="Open menu"
            onClick={() => setPanel("menu")}
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>

      <main>
        <section className="collection" id="collection" aria-label="Interactive new collection">
          <div className="collection-grain" />
          <div className="collection-kicker">
            <span className="live-dot" /> NEW COLLECTION <span className="divider">/</span> PREMIUM
            STREETWEAR
          </div>
          <div className="hero-heading">
            <h1>
              Original designs.
              <br />
              <span>T-shirts made for you.</span>
            </h1>
          </div>
          <div
            className={`rack${isDragging ? " is-dragging" : ""}`}
            aria-label="Swipe or use arrow keys to browse jerseys"
            tabIndex={0}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                move(e.key === "ArrowLeft" ? -1 : 1);
              }
            }}
            onPointerDown={(e) => {
              if (!e.isPrimary || e.button !== 0 || drag.current) return;
              suppressRackClick.current = false;
              if ((e.target as HTMLElement).closest(".rack-arrow")) return;
              const piece = e.currentTarget.querySelector<HTMLElement>(".piece");
              if (!piece) return;
              drag.current = {
                pointerId: e.pointerId,
                x: e.clientX,
                y: e.clientY,
                distance: 0,
                width: piece.offsetWidth,
                index: active,
                axis: null,
              };
            }}
            onPointerMove={(e) => {
              const gesture = drag.current;
              if (!gesture || gesture.pointerId !== e.pointerId) return;
              const dx = e.clientX - gesture.x;
              const dy = e.clientY - gesture.y;
              if (!gesture.axis) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
                gesture.axis = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
                if (gesture.axis === "horizontal") {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  suppressRackClick.current = true;
                  pauseAutoSlideTemporarily();
                  setTurned(null);
                  setIsDragging(true);
                }
              }
              if (gesture.axis !== "horizontal") return;
              // Keep the end jerseys on screen rather than dragging into an empty rack.
              gesture.distance = Math.max(
                -(products.length - 1 - gesture.index) * gesture.width,
                Math.min(gesture.index * gesture.width, dx),
              );
              setDragOffset(gesture.distance);
            }}
            onPointerUp={(e) => {
              const gesture = drag.current;
              if (!gesture || gesture.pointerId !== e.pointerId) return;
              if (gesture.axis === "horizontal") {
                const distance = gesture.distance;
                const steps =
                  Math.abs(distance) >= Math.min(24, gesture.width * 0.18)
                    ? Math.max(1, Math.round(Math.abs(distance) / gesture.width))
                    : 0;
                setActive(
                  Math.max(
                    0,
                    Math.min(products.length - 1, gesture.index - Math.sign(distance) * steps),
                  ),
                );
              }
              drag.current = null;
              setDragOffset(0);
              setIsDragging(false);
              if (e.currentTarget.hasPointerCapture(e.pointerId))
                e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={() => {
              drag.current = null;
              suppressRackClick.current = false;
              setDragOffset(0);
              setIsDragging(false);
            }}
            onLostPointerCapture={(e) => {
              // Touch starts with implicit capture on the jersey; ignore its transfer to the rack.
              if (e.target !== e.currentTarget) return;
              drag.current = null;
              setDragOffset(0);
              setIsDragging(false);
            }}
            onClickCapture={(e) => {
              if (!suppressRackClick.current) return;
              e.preventDefault();
              e.stopPropagation();
              suppressRackClick.current = false;
            }}
          >
            <div className="clothing-rail">
              <div />
            </div>
            <div
              className="pieces"
              style={{ "--active": active, "--drag-offset": `${dragOffset}px` } as CSSProperties}
            >
              {products.map((product, index) => (
                <button
                  key={product.id}
                  className={`piece ${active === index ? "is-selected" : ""} ${turned === index ? "is-turned" : ""}`}
                  style={{ "--i": index } as CSSProperties}
                  onClick={() => selectPiece(index)}
                  aria-label={`${product.name}, ${product.color}. ${active === index && turned === index ? "View details" : "Tap to turn"}`}
                >
                  <div className="piece-sway">
                    <Hanger />
                    <div className="garment">
                      <img
                        src={image(product)}
                        alt={`${product.name}, ${product.color}, front view`}
                        draggable={false}
                        fetchPriority={index === active ? "high" : "low"}
                        loading={Math.abs(index - active) <= 1 ? "eager" : "lazy"}
                      />
                      <img
                        className="rack-back"
                        src={image(product, true)}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        loading="lazy"
                      />
                    </div>
                    <span className="price-tag">
                      <span>JERSEY EDIT</span>
                      {countLabel(index + 1)}
                      <span className="tag-hole" />
                    </span>
                  </div>
                  <span className="piece-floor" />
                  <span className="piece-label">
                    <span>{product.color}</span>
                    <span>
                      {active === index && turned === index
                        ? "TAKE A CLOSER LOOK ↗"
                        : "ORIGINAL ARTWORK · FRONT & BACK"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <button
              className="rack-arrow rack-prev icon-button"
              aria-label="Previous color"
              onClick={() => move(-1)}
            >
              <Icon name="left" />
            </button>
            <button
              className="rack-arrow rack-next icon-button"
              aria-label="Next color"
              onClick={() => move(1)}
            >
              <Icon name="right" />
            </button>
          </div>
          <div className="collection-footer">
            <div className="rack-pagination">
              <div ref={pagination} role="group" aria-label="Jersey colors, scroll to browse">
                {products.map((product, i) => (
                  <button
                    key={product.id}
                    className={active === i ? "active" : ""}
                    aria-label={`Show ${product.name}, ${product.color}`}
                    aria-pressed={active === i}
                    onClick={() => {
                      pauseAutoSlideTemporarily();
                      setActive(i);
                      setTurned(null);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="values-strip">
          <span>Considered design.</span>
          <span className="value-plus">+</span>
          <span>Uncompromising comfort.</span>
          <span className="value-plus">+</span>
          <span>Yours, on repeat.</span>
          <Wordmark />
        </div>

        <section className="arrivals-section reveal" id="arrivals">
          <div className="section-heading arrivals-heading">
            <div>
              <span className="eyebrow">{countLabel(newProducts.length)} NEW ADDITIONS</span>
              <h2>
                Fresh off the rack<span>.</span>
              </h2>
              <p>Your latest artwork. Clean edges. Front to back.</p>
            </div>
            <div className="view-switch" role="group" aria-label="New arrivals image view">
              <button aria-pressed={!arrivalsBack} onClick={() => setArrivalsBack(false)}>
                Front view
              </button>
              <button aria-pressed={arrivalsBack} onClick={() => setArrivalsBack(true)}>
                Back view
              </button>
            </div>
          </div>
          <div className="arrivals-grid">
            {newProducts.map((product, index) => (
              <button
                className="arrival-card"
                key={product.id}
                onClick={() => {
                  openProduct(product);
                  setBack(arrivalsBack);
                }}
                aria-label={`Explore ${product.name}, ${product.color}`}
              >
                <div className="arrival-image">
                  <span className="arrival-badge">NEW / {countLabel(index + 1)}</span>
                  <img
                    src={image(product, arrivalsBack)}
                    alt={`${product.name}, ${product.color}, ${arrivalsBack ? "back" : "front"} view`}
                    loading="lazy"
                    width="1200"
                    height="1440"
                  />
                  <span className="arrival-side">{arrivalsBack ? "BACK" : "FRONT"}</span>
                  <span className="arrival-open">
                    <Icon name="plus" size={18} />
                  </span>
                </div>
                <div className="arrival-caption">
                  <h3>{product.name}</h3>
                  <span>
                    <i style={{ background: product.hex }} />
                    {product.color}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="arrivals-note">
            <span>Original artwork. Backgrounds removed. Ready for a closer look.</span>
            <a
              className="text-link"
              href="/images/jerseys/new-jersey-transparent-pngs.zip"
              download
            >
              Download {newProducts.length * 2} new PNGs <Icon name="arrow" size={16} />
            </a>
          </div>
        </section>

        <section className="look-section reveal" id="looks">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR ARTWORK, IN THE SPOTLIGHT</span>
              <h2>
                Find Your Jersey<span>.</span>
              </h2>
              <p>Your original designs, cut out and ready to explore.</p>
            </div>
            <span className="look-count">THREE LOOKS. ENDLESS POSSIBILITIES.</span>
          </div>
          <div className="look-layout">
            <div className="look-gallery">
              {looks.map((item, index) => (
                <button
                  key={item.title}
                  className={`look-model jersey-model ${look === index ? "selected" : ""}`}
                  onClick={() => setLook(index)}
                  aria-label={`Select ${item.title} look`}
                  aria-pressed={look === index}
                >
                  <img
                    src={image(products[item.color])}
                    alt={`${products[item.color].name}, ${products[item.color].color}`}
                    loading="lazy"
                  />
                  <span className="look-number">0{index + 1}</span>
                  {look === index && (
                    <span
                      className="model-pin"
                      onClick={(e) => {
                        e.stopPropagation();
                        openProduct(products[item.color]);
                      }}
                    >
                      <Icon name="plus" size={17} />
                    </span>
                  )}
                </button>
              ))}
              <div className="look-gallery-caption">
                <span>FIND YOUR OWN RHYTHM.</span>
                <span>STYLED, NOT OVERTHOUGHT.</span>
              </div>
            </div>
            <div className="look-details" key={look}>
              <span className="eyebrow">{looks[look].label}</span>
              <h3>{looks[look].title}</h3>
              <p>{looks[look].subtitle}</p>
              <div className="look-piece">
                <img
                  src={image(products[looks[look].color], true)}
                  alt={`${products[looks[look].color].name}, back view`}
                  loading="lazy"
                />
                <div>
                  <span className="eyebrow">THE FOUNDATION</span>
                  <h4>{products[looks[look].color].name}</h4>
                  <span>{products[looks[look].color].color}</span>
                  <strong>{money(products[looks[look].color].price)}</strong>
                </div>
                <button
                  className="icon-button"
                  aria-label="View jersey in this look"
                  onClick={() => openProduct(products[looks[look].color])}
                >
                  <Icon name="plus" />
                </button>
              </div>
              <div className="look-note">
                <span className="live-dot" /> ONE GOOD PIECE CHANGES EVERYTHING.
              </div>
              <button
                className="primary-button"
                onClick={() => openProduct(products[looks[look].color])}
              >
                Make it yours <Icon name="arrow" size={19} />
              </button>
              <div className="look-controls">
                <button
                  className="icon-button"
                  aria-label="Previous look"
                  onClick={() => setLook((look + 2) % 3)}
                >
                  <Icon name="left" size={18} />
                </button>
                <span>
                  0{look + 1} <span>/ 03</span>
                </span>
                <button
                  className="icon-button"
                  aria-label="Next look"
                  onClick={() => setLook((look + 1) % 3)}
                >
                  <Icon name="right" size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="story-section reveal" id="story">
          <div className="story-image jersey-story">
            <img
              src={image(products[0])}
              alt="The Family Booyah jersey, original front artwork"
              loading="lazy"
            />
            <img
              src={image(products[0], true)}
              alt="The Family Booyah jersey, original back artwork"
              loading="lazy"
            />
            <span>YOUR ORIGINAL ARTWORK. FRONT TO BACK.</span>
          </div>
          <div className="story-copy">
            <span className="eyebrow">EVERY DETAIL TELLS YOUR STORY.</span>
            <h2>
              Your artwork.
              <br />
              From every angle.
            </h2>
            <p>
              From The Family Booyah to Cafe Spean Music, discover the artwork that makes each
              jersey your own. Original graphics and colors, without the distracting backgrounds.
            </p>
            <p>
              Explore every design from the front and back. Each image is carefully separated,
              framed, and displayed without changing the artwork.
            </p>
            <a className="text-link" href="#collection">
              Meet your new everyday <Icon name="arrow" size={18} />
            </a>
            <div className="fabric-facts">
              <div>
                <strong>{products.length}</strong>
                <span>ORIGINAL COLORWAYS</span>
              </div>
              <div>
                <strong>{products.length * 2}</strong>
                <span>FRONT & BACK CUTOUTS</span>
              </div>
            </div>
          </div>
        </section>
        <section className="closing-note reveal">
          <span className="eyebrow">A LITTLE MORE YOU. EVERY SINGLE DAY.</span>
          <h2>IFONG.</h2>
          <a className="rounded-button" href="#collection">
            Find your everyday <Icon name="arrow" size={19} />
          </a>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-connect">
          <div>
            <h2 className="footer-label">STAY IN TOUCH</h2>
            <nav className="social-links" aria-label="Contact YAK on social media">
              <a href="https://t.me/Phochaifong" target="_blank" rel="noopener noreferrer">
                <Icon name="telegram" size={18} /> Telegram
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href="https://www.tiktok.com/@ifong168" target="_blank" rel="noopener noreferrer">
                <Icon name="tiktok" size={18} /> TikTok
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                href="https://www.facebook.com/share/1KDexeHzu3/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="facebook" size={18} /> Facebook
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </nav>
          </div>
          <div className="footer-payments">
            <h2 className="footer-label">PAYMENT METHODS</h2>
            <ul className="payment-marks" aria-label="Payment brands, display only">
              <li className="payment-mark payment-aba" aria-label="ABA">
                ABA<span aria-hidden="true">′</span>
              </li>
              <li className="payment-mark payment-acleda" aria-label="ACLEDA">
                ACLEDA
              </li>
              <li className="payment-mark payment-visa" aria-label="Visa">
                VISA
              </li>
              <li className="payment-mark payment-bakong" aria-label="Bakong">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path
                    d="m12 2 8.7 5v10L12 22l-8.7-5V7L12 2Zm0 5 4.3 2.5v5L12 17l-4.3-2.5v-5L12 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Bakong
              </li>
            </ul>
            <p className="payment-disclaimer">Display only · Online payments are not connected.</p>
          </div>
        </div>
        <div className="footer-top">
          <a href="#collection" className="brand" aria-label="Back to collection">
            <Wordmark />
          </a>
          <p className="ifong-wordmark">
            <span>i</span>FONG
          </p>
          <div>
            <a href="#collection">The Collection</a>
            <a href="#looks">Shop the Look</a>
            <a href="#story">Our Story</a>
          </div>
          <button
            className="text-link"
            onClick={() => setToast("This concept storefront displays prices in USD.")}
          >
            <Icon name="globe" size={17} /> United States · USD
          </button>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} THE JERSEY IFONG</span>
        </div>
      </footer>

      {detail && (
        <Dialog title={detail.name} close={close}>
          <div className="product-dialog">
            <div className="product-visual">
              <span className="eyebrow">THE ORIGINAL JERSEY EDIT</span>
              <div
                className={`product-turntable ${back ? "show-back" : ""}`}
                onClick={() => setZoom(true)}
                title="ចុចដើម្បីពង្រីកមើលជិតៗ (Click to zoom)"
              >
                <img
                  className="product-front"
                  src={image(detail)}
                  alt={`${detail.name}, ${detail.color}, front view`}
                />
                <img
                  className="product-back"
                  src={image(detail, true)}
                  alt={`${detail.name}, ${detail.color}, back view`}
                />
                <span className="zoom-indicator">
                  <Icon name="search" size={13} /> ចុចមើលជិតៗ
                </span>
              </div>
              <div className="product-visual-actions">
                <button className="rotate-button" onClick={() => setBack(!back)}>
                  <Icon name="rotate" size={16} /> {back ? "View front" : "Turn it around"}
                </button>
                <button className="rotate-button zoom-btn" onClick={() => setZoom(true)}>
                  <Icon name="search" size={15} /> មើលជិតៗ (Zoom)
                </button>
              </div>
            </div>
            <div className="product-info">
              <span className="eyebrow">YOUR NEW EVERYDAY</span>
              <h2>{detail.name}</h2>
              <div className="product-price">
                {money(detail.price)}
                <span>USD</span>
              </div>
              <p>
                Your original {detail.name.replace(" Jersey", "")} artwork in{" "}
                {detail.color.toLowerCase()}. Explore the actual front and back designs, carefully
                cut out from your supplied images.
              </p>
              <div className="color-title">
                Design & color <span>— {detail.color}</span>
              </div>
              <div className="color-swatches">
                {products.map((product) => (
                  <button
                    key={product.id}
                    className={product.id === detail.id ? "selected" : ""}
                    style={{ "--swatch": product.hex } as CSSProperties}
                    aria-label={`${product.name}, ${product.color}`}
                    title={`${product.name} — ${product.color}`}
                    aria-pressed={product.id === detail.id}
                    onClick={() => {
                      setDetail(product);
                      setBack(false);
                      window.history.replaceState(null, "", `?product=${product.id}`);
                    }}
                  />
                ))}
              </div>
              <div className="size-title">
                <span>Select size</span>
                <button onClick={() => setSizeGuide(!sizeGuide)}>
                  {sizeGuide ? "Close size guide" : "Size guide"}
                </button>
              </div>
              {sizeGuide ? (
                <div className="size-guide">
                  <p>
                    Sizes are preview options. Measurements have not been provided yet. Please
                    confirm the actual size chart before placing any orders.
                  </p>
                </div>
              ) : (
                <div className="size-options">
                  {sizes.map((s) => (
                    <button
                      className={size === s ? "selected" : ""}
                      key={s}
                      aria-pressed={size === s}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="product-actions-group">
                <button
                  className="telegram-button"
                  onClick={() => buyViaTelegram(detail, size)}
                  aria-label={`Buy ${detail.name} via Telegram`}
                >
                  <Icon name="telegram" size={20} />
                  <span>ទិញតាម Telegram — {money(detail.price)}</span>
                </button>
                <button
                  className="secondary-bag-button"
                  onClick={() => addToBag(detail)}
                  aria-label={`Add ${detail.name} to bag`}
                >
                  <Icon name="bag" size={16} />
                  <span>ដាក់ក្នុងកន្ត្រក (Add to bag)</span>
                </button>
              </div>
              <span className="shipping-note">
                <Icon name="check" size={15} /> Original uploaded artwork · Front & back
              </span>
              <details>
                <summary>
                  Details & care <Icon name="plus" size={16} />
                </summary>
                <p>
                  Short-sleeve graphic top with the original printed design on both sides. Fabric
                  composition, measurements, and care instructions are awaiting the owner's
                  confirmation.
                </p>
              </details>
              <p className="concept-note">
                Original artwork · Size options are for preview. No payment is collected.
              </p>
              <div className="cutout-downloads">
                <span>TRANSPARENT PNG</span>
                <a href={cutout(detail)} download>
                  Front ↓
                </a>
                <a href={cutout(detail, true)} download>
                  Back ↓
                </a>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {zoom && detail && (
        <div className="zoom-modal-overlay" onClick={() => { setZoom(false); setZoomLevel(1); }}>
          <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="zoom-header">
              <div className="zoom-title-info">
                <h3>{detail.name}</h3>
                <span>{detail.color} · {back ? "រូបខាងក្រោយ (Back view)" : "រូបខាងមុខ (Front view)"}</span>
              </div>
              <div className="zoom-header-actions">
                <button
                  className="zoom-tool-btn"
                  onClick={() => setBack(!back)}
                  title="ប្តូរមើលមុខ / ក្រោយ"
                >
                  <Icon name="rotate" size={16} />
                  <span>{back ? "មើលខាងមុខ" : "មើលខាងក្រោយ"}</span>
                </button>
                <button
                  className="zoom-tool-btn"
                  onClick={() => setZoomLevel((lvl) => (lvl >= 2.5 ? 1 : lvl + 0.75))}
                  title="ពង្រីក / បង្រួម"
                >
                  <Icon name="search" size={16} />
                  <span>{zoomLevel > 1 ? String(Math.round(zoomLevel * 100)) + "%" : "ពង្រីក (Zoom)"}</span>
                </button>
                <button
                  className="icon-button zoom-close-btn"
                  aria-label="Close zoom preview"
                  onClick={() => {
                    setZoom(false);
                    setZoomLevel(1);
                  }}
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
            </div>
            <div
              className={`zoom-image-container ${zoomLevel > 1 ? "is-zoomed" : ""}`}
              onClick={() => setZoomLevel((lvl) => (lvl > 1 ? 1 : 2))}
              title={zoomLevel > 1 ? "ចុចដើម្បីបង្រួម (Click to reset)" : "ចុចដើម្បីពង្រីក (Click to zoom 2x)"}
            >
              <img
                src={cutout(detail, back)}
                alt={detail.name + " close-up view"}
                style={{ transform: "scale(" + zoomLevel + ")" }}
                className="zoom-highres-img"
              />
            </div>
            <div className="zoom-footer-hint">
              <span>💡 ចុចលើរូបអាវដើម្បីពង្រីក ឬបង្រួម (Click image to zoom/reset)</span>
            </div>
          </div>
        </div>
      )}

      {panel === "bag" && (
        <Dialog title="Your shopping bag" close={close} drawer>
          <div className="bag-heading">
            <span className="eyebrow">THE GOOD STUFF</span>
            <h2>
              Your bag <sup>({bagCount})</sup>
            </h2>
          </div>
          {bag.length ? (
            <>
              <div className="bag-items">
                {bag.map((item) => (
                  <div className="bag-item" key={`${item.product.id}-${item.size}`}>
                    <img src={image(item.product)} alt={item.product.color} />
                    <div>
                      <h3>{item.product.name}</h3>
                      <p>
                        {item.product.color} · {item.size}
                      </p>
                      <strong>{money(item.product.price)}</strong>
                      <div className="quantity-control">
                        <button
                          aria-label={`Remove one ${item.product.color}, size ${item.size}`}
                          onClick={() =>
                            setBag((items) =>
                              items
                                .map((x) => (x === item ? { ...x, quantity: x.quantity - 1 } : x))
                                .filter((x) => x.quantity > 0),
                            )
                          }
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          aria-label={`Add one ${item.product.color}, size ${item.size}`}
                          onClick={() => addToBag(item.product, item.size)}
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="icon-button"
                      aria-label={`Remove ${item.product.color} from bag`}
                      onClick={() => setBag((items) => items.filter((x) => x !== item))}
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="bag-summary">
                <div>
                  <span>Subtotal</span>
                  <strong>{money(total)}</strong>
                </div>
                <div>
                  <span>Shipping</span>
                  <span>Not configured</span>
                </div>
                <button
                  className="telegram-button"
                  style={{ width: "100%", marginBottom: "10px" }}
                  onClick={checkoutBagViaTelegram}
                >
                  <Icon name="telegram" size={20} />
                  <span>កុម្ម៉ង់ទាំងអស់តាម Telegram — {money(total)}</span>
                </button>
                <button className="primary-button" onClick={() => navigate("collection")}>
                  Keep exploring <Icon name="arrow" size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="empty-bag">
              <Icon name="bag" size={45} />
              <h3>Room for something good.</h3>
              <p>Your everyday favorites are waiting.</p>
              <button className="primary-button" onClick={() => navigate("collection")}>
                Explore the collection <Icon name="arrow" size={18} />
              </button>
            </div>
          )}
        </Dialog>
      )}

      {panel === "search" && (
        <Dialog title="Search collection" close={close}>
          <div className="search-panel">
            <span className="eyebrow">FIND YOUR EVERYDAY</span>
            <h2>Looking for something?</h2>
            <div className="search-input">
              <Icon name="search" />
              <input
                autoFocus
                type="search"
                placeholder="Try “Booyah”, “jersey”, or “blue”"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
            </div>
            <div className="search-results">
              {products
                .filter((product) =>
                  `${product.name} ${product.color}`
                    .toLowerCase()
                    .includes(query.toLowerCase().trim()),
                )
                .map((product) => (
                  <button key={product.id} onClick={() => openProduct(product)}>
                    <img src={image(product)} alt={product.color} />
                    <span>
                      {product.color}
                      <small>{product.name}</small>
                    </span>
                    <span>
                      {money(product.price)} <Icon name="arrow" size={17} />
                    </span>
                  </button>
                ))}
              {!products.some((product) =>
                `${product.name} ${product.color}`
                  .toLowerCase()
                  .includes(query.toLowerCase().trim()),
              ) && (
                <p className="no-results">No matches just yet. Try a design, or search “jersey”.</p>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {panel === "menu" && (
        <Dialog title="Navigation" close={close} drawer>
          <div className="mobile-menu">
            <Wordmark />
            <span className="eyebrow">GOOD THINGS. ON REPEAT.</span>
            {[
              ["New Collection", "collection"],
              ["New Arrivals", "arrivals"],
              ["Shop the Look", "looks"],
              ["Our Story", "story"],
            ].map(([label, id], i) => (
              <button onClick={() => navigate(id)} key={id}>
                <span>0{i + 1}</span>
                {label}
                <Icon name="arrow" />
              </button>
            ))}
            <p>
              Considered design.
              <br />
              Uncompromising comfort.
            </p>
          </div>
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          <span>{toast}</span>
          <button aria-label="Dismiss notification" onClick={() => setToast("")}>
            <Icon name="close" size={17} />
          </button>
        </div>
      )}
    </>
  );
}
