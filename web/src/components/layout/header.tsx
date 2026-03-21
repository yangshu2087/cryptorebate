"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "./theme-toggle";
import {
  LOCALES,
  LOCALE_LABELS,
  NAV_ITEMS,
  SITE_NAME,
  type Locale,
} from "@/lib/constants";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const brandTagline = t("metadata.siteTagline");

  const handleLocaleChange = (nextLocale: string | null) => {
    if (!nextLocale) {
      return;
    }

    setOpen(false);
    router.replace(pathname, { locale: nextLocale as Locale });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/82 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="hidden min-w-0 items-center lg:flex">
            <Image
              src="/images/brand/cryptorebate-wordmark.svg"
              alt={`${SITE_NAME} logo`}
              width={204}
              height={40}
              className="h-10 w-auto dark:hidden"
              priority
            />
            <Image
              src="/images/brand/cryptorebate-wordmark-dark.svg"
              alt={`${SITE_NAME} logo`}
              width={204}
              height={40}
              className="hidden h-10 w-auto dark:block"
              priority
            />
          </div>
          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <Image
              src="/images/brand/cryptorebate-mark.svg"
              alt={`${SITE_NAME} logo`}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0"
              priority
            />
            <div className="min-w-0">
              <div className="text-base font-semibold leading-none tracking-tight sm:text-lg">{SITE_NAME}</div>
            </div>
          </div>
          <div className="hidden min-w-0 xl:block">
            <div className="mt-1 truncate text-[11px] font-medium text-muted-foreground">
              {brandTagline}
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                pathname === item.href
                  ? "bg-accent/80 text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="h-9 w-[148px] rounded-full border-border/70 bg-background/70 text-sm shadow-sm" aria-label={t("nav.language")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((supportedLocale) => (
                <SelectItem key={supportedLocale} value={supportedLocale}>
                  {LOCALE_LABELS[supportedLocale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ThemeToggle />

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-2">
                <div className="px-3 pb-1">
                  <div className="mb-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                    <div className="text-sm font-semibold">{SITE_NAME}</div>
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {brandTagline}
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-2">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("nav.language")}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {LOCALES.map((supportedLocale) => (
                      <button
                        key={supportedLocale}
                        type="button"
                        onClick={() => handleLocaleChange(supportedLocale)}
                        className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                          locale === supportedLocale
                            ? "border-brand bg-brand/10 text-foreground"
                            : "border-border text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {LOCALE_LABELS[supportedLocale]}
                      </button>
                    ))}
                  </div>
                </div>
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent ${
                      pathname === item.href
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
