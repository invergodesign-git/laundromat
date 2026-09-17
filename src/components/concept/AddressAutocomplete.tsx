"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { fetchSuggestions } from "@/lib/geo/client";
import { GeoError, type AddressSuggestion } from "@/lib/geo/types";
import { cn } from "@/lib/utils";

/** Wait for a pause in typing before spending an API credit. */
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

interface AddressAutocompleteProps {
  id: string;
  placeholder?: string;
  /** Prefill when carrying an address from the pricing estimator. */
  initialLabel?: string;
  /** Fired when a suggestion is chosen from the list. */
  onSelect: (suggestion: AddressSuggestion) => void;
  /** Fired when the text no longer matches the chosen suggestion. */
  onClear: () => void;
  /** Shown when the lookup service is unavailable or switched off. */
  onUnavailable?: (message: string) => void;
  disabled?: boolean;
}

/**
 * Address field with a suggestion dropdown.
 *
 * Implemented as an ARIA combobox rather than a plain input so it is usable
 * from the keyboard and announced correctly by screen readers. Requests are
 * debounced and the previous one is aborted on every keystroke, so typing an
 * address costs a handful of API credits rather than one per character.
 */
export function AddressAutocomplete({
  id,
  placeholder = "Start typing your street address",
  initialLabel,
  onSelect,
  onClear,
  onUnavailable,
  disabled = false,
}: AddressAutocompleteProps) {
  const listboxId = useId();
  const optionId = useId();

  const [query, setQuery] = useState(initialLabel ?? "");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  /** True once a lookup has run and come back with nothing to offer. */
  const [noMatches, setNoMatches] = useState(false);

  const wrapper = useRef<HTMLDivElement>(null);
  /** Text of the suggestion currently accepted, so we can detect edits. */
  const selectedText = useRef<string | null>(initialLabel ?? null);

  // Debounced lookup. The abort controller cancels the in-flight request when
  // another keystroke arrives, so late responses can never overwrite newer ones.
  useEffect(() => {
    const trimmed = query.trim();

    if (disabled || trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setNoMatches(false);
      setLoading(false);
      return;
    }

    // Nothing to look up while the field still shows an accepted suggestion.
    if (selectedText.current !== null && trimmed === selectedText.current) {
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(trimmed, controller.signal);
        setSuggestions(results);
        setNoMatches(results.length === 0);
        setActiveIndex(-1);
        setOpen(true);
      } catch (error) {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setNoMatches(false);
        setOpen(false);
        if (error instanceof GeoError && onUnavailable) {
          onUnavailable(error.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, disabled, onUnavailable]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const choose = (suggestion: AddressSuggestion) => {
    const text = [suggestion.label, suggestion.context]
      .filter(Boolean)
      .join(", ");

    selectedText.current = text;
    setQuery(text);
    setSuggestions([]);
    setNoMatches(false);
    setOpen(false);
    setActiveIndex(-1);
    onSelect(suggestion);
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (selectedText.current !== null && value !== selectedText.current) {
      selectedText.current = null;
      onClear();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!open || suggestions.length === 0) {
      if (event.key === "ArrowDown" && suggestions.length > 0) {
        event.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const suggestion = suggestions[activeIndex];
      if (suggestion) choose(suggestion);
    }
  };

  return (
    <div ref={wrapper} className="relative">
      <div
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-owns={listboxId}
        aria-haspopup="listbox"
      >
        <MapPin
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-royal"
        />
        <input
          id={id}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => (suggestions.length > 0 || noMatches) && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${optionId}-${activeIndex}` : undefined
          }
          className="h-14 w-full rounded-2xl border border-ink/10 bg-white/85 pl-11 pr-11 font-geist text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-royal/60 disabled:opacity-60"
        />
        {loading && (
          <Loader2
            aria-hidden="true"
            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-royal"
          />
        )}
      </div>

      <ul
        id={listboxId}
        role="listbox"
        aria-label="Address suggestions"
        className={cn(
          "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_24px_48px_-24px_rgba(20,18,41,0.45)]",
          open && suggestions.length > 0 ? "block" : "hidden"
        )}
      >
        {suggestions.map((suggestion, index) => (
          <li
            key={suggestion.id}
            id={`${optionId}-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            onPointerDown={(e) => {
              e.preventDefault();
              choose(suggestion);
            }}
            onMouseEnter={() => setActiveIndex(index)}
            className={cn(
              "cursor-pointer px-4 py-3 transition-colors",
              index === activeIndex ? "bg-royal/10" : "bg-white"
            )}
          >
            <span className="block text-[0.9375rem] font-medium leading-tight text-ink">
              {suggestion.label}
            </span>
            {suggestion.context && (
              <span className="mt-0.5 block text-[0.8125rem] leading-tight text-ink/55">
                {suggestion.context}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/*
        A lookup that returns nothing used to render as an empty box, which
        reads as "the site is broken" rather than "that address wasn't found".
      */}
      {open && noMatches && !loading && (
        <p
          role="status"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-[0.875rem] leading-snug text-ink/60 shadow-[0_24px_48px_-24px_rgba(20,18,41,0.45)]"
        >
          No matches. Try the full street name rather than an abbreviation, or
          give us a call and we&rsquo;ll sort it out.
        </p>
      )}
    </div>
  );
}
