"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { slug: string; name: string };

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

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/tienda/${storeSlug}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Input
        placeholder="Buscar..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => setParam("q", e.target.value)}
        className="w-48"
      />

      {categories.length > 0 ? (
        <Select
          value={searchParams.get("category") ?? ""}
          onValueChange={(value) => setParam("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {sizes.length > 0 ? (
        <Select
          value={searchParams.get("size") ?? ""}
          onValueChange={(value) => setParam("size", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Talla" />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {colors.length > 0 ? (
        <Select
          value={searchParams.get("color") ?? ""}
          onValueChange={(value) => setParam("color", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Color" />
          </SelectTrigger>
          <SelectContent>
            {colors.map((color) => (
              <SelectItem key={color} value={color}>
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}
