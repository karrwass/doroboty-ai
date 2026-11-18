/**
 * Application shells in DoRoboty Design (docs/design-system/DOROBOTY-DESIGN.md).
 * - Komfort: public pages and the candidate workspace (light top bar + category stripe).
 * - Praca: employer and operator workspaces (ink app bar + light navigation).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { BrandMark, Wordmark } from "@/design-system/components";
import { currentPerson, type Person } from "./model";
import { usePrototype } from "./store";

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="ds-info" style={{ marginBottom: "var(--space-4)" }}>
      <span>{children}</span>
    </div>
  );
}
/** Page title: the name of the place, optional subline and one action. */
export function PageTitle({
  children,
  action,
  lead,
}: {
  children: ReactNode;
  action?: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <div className="ds-page-head" style={{ marginBottom: "var(--space-5)" }}>
      <div>
        <h1 className="ds-title">{children}</h1>
        {lead && (
          <p className="ds-lead" style={{ margin: 0 }}>
            {lead}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
/** Komfort content column (720px); wide for listings. Inside Praca it adds nothing. */
export function Page({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={wide ? "ds-page ds-page-wide" : "ds-page"}>{children}</div>;
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="ds-empty">{children}</div>;
}
export function NotFound() {
  return (
    <Page>
      <section className="ds-card">
        <h1 className="ds-title">Nie znaleziono strony</h1>
        <p className="ds-sentence">Ten adres nie prowadzi do dostępnej oferty lub aplikacji.</p>
        <div className="ds-actions" style={{ marginTop: 0 }}>
          <Link className="ds-btn ds-btn-primary" to="/oferty">
            Wróć do ofert
          </Link>
        </div>
      </section>
    </Page>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2);
}
function isActive(pathname: string, to: string, search = "") {
  const [path, query] = to.split("?");
  // A link with a query ("Dla firm") is current only for that audience.
  if (query && !search.includes(query.split("&")[0])) return false;
  return path === "/app"
    ? pathname === "/app"
    : pathname === path || pathname.startsWith(`${path}/`);
}

/** Praca: ink app bar with brand, product name, company and account; light navigation below. */
const employerNav = [
  ["/app", "Pulpit"],
  ["/app/oferty", "Ogłoszenia"],
  ["/app/kandydaci", "Kandydaci"],
  ["/app/organizacja", "Organizacja"],
  ["/app/settings", "Ustawienia"],
] as const;
const operatorNav = [
  ["/app/case", "Materiały case study"],
  ["/app/settings", "Ustawienia"],
] as const;
function PracaShell({
  children,
  mainRef,
  menuOpen,
  onMenu,
  person,
  companyName,
}: {
  children: ReactNode;
  mainRef: React.RefObject<HTMLElement | null>;
  menuOpen: boolean;
  onMenu: (open: boolean) => void;
  person: Person;
  companyName?: string;
}) {
  const { pathname } = useLocation();
  const employer = person.role === "employer";
  const nav = employer ? employerNav : operatorNav;
  const product = employer ? "Panel firmy" : "Panel prowadzącego";
  return (
    <div className="ds ds-canvas ds-shell">
      <header className="ds-appbar ds-on-dark">
        <Link
          className="ds-brand"
          to={employer ? "/app" : "/app/case"}
          aria-label={`DoRoboty.ai — ${product.toLowerCase()}`}
        >
          <BrandMark />
          <Wordmark />
        </Link>
        <span className="ds-sep" aria-hidden="true" />
        <span className="ds-prod">{product}</span>
        <div className="ds-right">
          {companyName && (
            <span className="ds-org">
              {companyName} <span className="ds-label">PRZYKŁAD</span>
            </span>
          )}
          <Link
            className="ds-avatar"
            to="/auth/sign-in"
            aria-label={`Konto: ${person.name}. Zmień osobę`}
            title="Zmień osobę"
          >
            {initials(person.name)}
          </Link>
        </div>
        <button
          type="button"
          className="ds-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="ds-praca-nav"
          aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
          onClick={() => onMenu(!menuOpen)}
        >
          Menu
        </button>
      </header>
      <aside
        className="ds-side"
        data-open={menuOpen ? "" : undefined}
        onKeyDown={(e) => {
          if (e.key === "Escape") onMenu(false);
        }}
      >
        <p className="ds-side-context ds-meta">
          {product}
          {companyName ? ` · ${companyName} (PRZYKŁAD)` : ""} · {person.name}
        </p>
        <nav id="ds-praca-nav" aria-label={product}>
          <ul className="ds-nav">
            {nav.map(([to, label]) => (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={isActive(pathname, to) ? "page" : undefined}
                  onClick={() => onMenu(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="ds-nav ds-nav-secondary">
            <li>
              <Link to="/oferty">Wszystkie oferty</Link>
            </li>
            <li>
              <Link to="/auth/sign-in">Zmień osobę</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main id="main" ref={mainRef} tabIndex={-1} className="ds-main">
        <div className="ds-content">{children}</div>
      </main>
    </div>
  );
}

/** Komfort: light top bar with category stripe, navigation in the bar, account on the right. */
function KomfortShell({
  children,
  mainRef,
  menuOpen,
  onMenu,
  person,
}: {
  children: ReactNode;
  mainRef: React.RefObject<HTMLElement | null>;
  menuOpen: boolean;
  onMenu: (open: boolean) => void;
  person?: Person;
}) {
  const { pathname, search } = useLocation();
  const candidate = person?.role === "candidate";
  const links: [string, string][] = [
    ["/oferty", "Oferty"],
    ["/metodologia", "Jak wybieramy role"],
    ...(candidate
      ? ([
          ["/app/zapisane", "Zapisane"],
          ["/app/aplikacje", "Aplikacje"],
          ["/app/profil", "Profil"],
        ] as [string, string][])
      : []),
    ["/auth/sign-in?audience=employer&next=/app/oferty", "Dla firm"],
  ];
  const menuLinks: [string, string][] = person
    ? [
        ...links,
        [person.role === "operator" ? "/app/case" : "/app", "Moje konto"],
        ["/app/settings", "Ustawienia"],
        ["/auth/sign-in", "Zmień osobę"],
      ]
    : [...links, ["/auth/sign-in?audience=candidate", "Wybierz osobę"]];
  return (
    <div className="ds reg-komfort ds-canvas">
      <header className="ds-topbar">
        <div className="ds-topbar-in">
          <Link className="ds-brand" to="/" aria-label="DoRoboty.ai — strona główna">
            <BrandMark />
            <Wordmark />
          </Link>
          <nav className="ds-topnav" aria-label="Główna nawigacja">
            {links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(pathname, to, search) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="ds-topbar-right">
            {person ? (
              <>
                <Link className="ds-link" to="/auth/sign-in">
                  Zmień osobę
                </Link>
                <Link
                  className="ds-avatar"
                  to={person.role === "operator" ? "/app/case" : "/app"}
                  aria-label={`Moje konto: ${person.name}`}
                  title="Moje konto"
                >
                  {initials(person.name)}
                </Link>
              </>
            ) : (
              <Link className="ds-btn ds-btn-secondary" to="/auth/sign-in?audience=candidate">
                Wybierz osobę
              </Link>
            )}
          </div>
          <button
            type="button"
            className="ds-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="ds-komfort-menu"
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            onClick={() => onMenu(!menuOpen)}
          >
            Menu
          </button>
        </div>
        <div className="ds-stripe" aria-hidden="true" />
        <nav
          id="ds-komfort-menu"
          className="ds-topmenu"
          aria-label="Menu"
          data-open={menuOpen ? "" : undefined}
          onKeyDown={(e) => {
            if (e.key === "Escape") onMenu(false);
          }}
        >
          <ul>
            {menuLinks.map(([to, label]) => (
              <li key={`${to}-${label}`}>
                <Link
                  to={to}
                  aria-current={isActive(pathname, to, search) ? "page" : undefined}
                  onClick={() => onMenu(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1} style={{ outline: "none" }}>
        {children}
      </main>
      <footer className="ds-footer">
        <div className="ds-footer-in">
          <div>
            <Link className="ds-brand" to="/" style={{ color: "var(--ink)" }}>
              <BrandMark />
              <Wordmark />
            </Link>
            <p style={{ maxWidth: "48ch", margin: "var(--space-2) 0 0" }}>
              Praca dla ludzi, którzy potrafią z AI zbudować coś wartościowego — nie tylko wpisać je
              do CV.
            </p>
            <p className="ds-caption">prototyp szkoleniowy · dane przykładowe</p>
          </div>
          <nav aria-label="Stopka">
            <Link to="/oferty">Oferty</Link>
            <Link to="/metodologia">Jak wybieramy role</Link>
            <Link to="/polityka-prywatnosci">Prywatność</Link>
            <Link to="/app/settings">Ustawienia prototypu</Link>
            <Link to="/auth/sign-in">Strefa case</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function Shell() {
  const { state, issue, error, clearError } = usePrototype();
  const person = currentPerson(state);
  const { pathname } = useLocation();
  const workspace = pathname.startsWith("/app") && person;
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const main = useRef<HTMLElement>(null);
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      clearError();
      main.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
      lastPath.current = pathname;
    }
  }, [pathname, clearError]);
  const messages = (
    <>
      {issue && (
        <Notice>
          {issue}{" "}
          <Link className="ds-link" style={{ minHeight: 0 }} to="/app/settings">
            Ustawienia danych
          </Link>
        </Notice>
      )}
      {error && (
        <p className="ds-error" role="alert" style={{ marginBottom: "var(--space-4)" }}>
          {error}
        </p>
      )}
    </>
  );
  const outlet = (
    <div key={`${state.activePersonId}:${pathname}`}>
      <Outlet />
    </div>
  );
  const menuOpen = menuAt === pathname;
  const onMenu = (open: boolean) => setMenuAt(open ? pathname : null);
  const skip = (
    <a
      href="#main"
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        main.current?.focus();
      }}
    >
      Przejdź do treści
    </a>
  );
  if (workspace && person.role !== "candidate")
    return (
      <>
        {skip}
        <PracaShell
          mainRef={main}
          menuOpen={menuOpen}
          onMenu={onMenu}
          person={person}
          companyName={state.companies.find((x) => x.id === person.companyId)?.name}
        >
          {messages}
          {outlet}
        </PracaShell>
      </>
    );
  return (
    <>
      {skip}
      <KomfortShell mainRef={main} menuOpen={menuOpen} onMenu={onMenu} person={person}>
        {(issue || error) && (
          <div className="ds-page ds-page-wide" style={{ paddingBottom: 0 }}>
            {messages}
          </div>
        )}
        {outlet}
      </KomfortShell>
    </>
  );
}
