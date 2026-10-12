"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { slug: string; name: string };

const SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

export function CatalogFilters({
  storeSlug,
  categories,
  sizes,
  colors,
}: {
  storeSlug: string;
  categories: Category[];
  sizes: string[];
  colors: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function setParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    router.push(`/tienda/${storeSlug}?${next.toString()}`);
  }

  // Debounce: evita navegar en cada tecla (antes disparaba un push por carácter).
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (search === current) return;
    const timer = setTimeout(() => setParams({ q: search || null }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar a `search`
  }, [search]);

  useEffect(() => {
    const currentMin = searchParams.get("minPrice") ?? "";
    const currentMax = searchParams.get("maxPrice") ?? "";
    if (minPrice === currentMin && maxPrice === currentMax) return;
    const timer = setTimeout(
      () => setParams({ minPrice: minPrice || null, maxPrice: maxPrice || null }),
      500,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar a min/max
  }, [minPrice, maxPrice]);

  const activeCategory = searchParams.get("category") ?? "";
  const activeSize = searchParams.get("size") ?? "";
  const activeColor = searchParams.get("color") ?? "";
  const activeSort = searchParams.get("sort") ?? "recent";

  const hasActiveFilters = Boolean(
    search || activeCategory || activeSize || activeColor || minPrice || maxPrice,
  );

  function clearAll() {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    router.push(`/tienda/${storeSlug}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48"
        />

        {categories.length > 0 ? (
          <FilterSelect
            placeholder="Categoría"
            value={activeCategory}
            onChange={(value) => setParams({ category: value })}
            options={categories.map((c) => ({ value: c.slug, label: c.name }))}
          />
        ) : null}

        {sizes.length > 0 ? (
          <FilterSelect
            placeholder="Talla"
            value={activeSize}
            onChange={(value) => setParams({ size: value })}
            options={sizes.map((s) => ({ value: s, label: s }))}
          />
        ) : null}

        {colors.length > 0 ? (
          <FilterSelect
            placeholder="Color"
            value={activeColor}
            onChange={(value) => setParams({ color: value })}
            options={colors.map((c) => ({ value: c, label: c }))}
          />
        ) : null}

        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Precio mín."
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-24"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Precio máx."
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24"
          />
        </div>

        <Select value={activeSort} onValueChange={(value) => setParams({ sort: value === "recent" ? null : value })}>
          <SelectTrigger className="ml-auto">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <XIcon />
            Limpiar filtros
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function FilterSelect({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string | null) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1">
      <Select value={value} onValueChange={(v) => onChange(v)}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Quitar filtro de ${placeholder.toLowerCase()}`}
          onClick={() => onChange(null)}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}
