# TiendaVit

SaaS multi-tenant de gestión de inventario para tiendas de ropa: panel administrativo privado por tienda y catálogo público en `/tienda/[slug]`, con aislamiento de datos por tienda vía RLS en Supabase/Postgres.

## Identidad visual — "TiendaVit Studio"

Paleta cálida y editorial (marfil/carbón/arena/verde profundo/terracota) definida como tokens CSS en `src/app/globals.css`, con Fraunces para titulares y Inter para todo lo funcional. El panel administrativo usa una barra lateral fija en escritorio y un menú deslizable en móvil; el catálogo público tiene encabezado con logo/búsqueda/carrito, una portada editorial (foto real si la tienda configuró `cover_image_url`, o una versión tipográfica si no) y pie de página con contacto. Componentes compartidos en `src/components/shared/` (`StatusBadge`, `EmptyState`) y `src/components/admin/`/`src/components/public/` para la navegación y el shell de cada experiencia.

## Stack

- Next.js (App Router) + TypeScript estricto
- Tailwind CSS + shadcn/ui (sobre Base UI, no Radix)
- Supabase (Postgres, Auth, Storage)
- Zod para validación
- Vitest para pruebas unitarias

## Requisitos

- Node 20.x (versión fijada deliberadamente: `@supabase/supabase-js`/`@supabase/ssr` están pineados a `2.109.0`/`0.12.0` porque versiones más nuevas requieren Node ≥22)
- npm
- Una cuenta/proyecto de Supabase (o el [CLI de Supabase](https://supabase.com/docs/guides/cli) para levantar uno)

## Configuración local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env.local` y completar los valores con los datos de tu proyecto Supabase (Project Settings → API):

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: públicas, se exponen al navegador.
   - `SUPABASE_SERVICE_ROLE_KEY`: **solo servidor**. Nunca debe prefijarse con `NEXT_PUBLIC_` ni importarse desde código `"use client"`. Solo la usa `src/lib/supabase/admin.ts`.
   - `NEXT_PUBLIC_SITE_URL`: URL base de la app (para enlaces de invitación, callbacks de auth, etc.).
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`: nombre del bucket de imágenes de producto (`product-images` por defecto).

3. Aplicar las migraciones a tu proyecto Supabase. Con el CLI vinculado al proyecto (`supabase link --project-ref <ref>`):

   ```bash
   npx supabase@latest db push --linked
   ```

   Las migraciones viven en `supabase/migrations/`, numeradas secuencialmente, y son el único lugar donde se modifica el esquema (nunca editar una migración ya aplicada; los cambios posteriores van en una migración nueva).

4. (Opcional) Regenerar los tipos de TypeScript a partir del esquema real tras aplicar migraciones:

   ```bash
   npm run db:types
   ```

5. Crear el bucket de Storage `product-images` si no existe (la migración `00000000000012_product_images_storage.sql` lo crea como público para lectura; verificar en el dashboard de Supabase → Storage si el CLI no lo aplicó).

6. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La app queda en `http://localhost:3000`. El catálogo público de una tienda activa está en `http://localhost:3000/tienda/<slug>`; el panel administrativo en `http://localhost:3000/tienda-admin/<slug>` (requiere sesión y membership en esa tienda).

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build de producción (requiere `build` previo) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Pruebas unitarias (Vitest, una sola corrida) |
| `npm run test:watch` | Vitest en modo watch |
| `npm run db:types` | Regenera `src/types/database.types.ts` desde el esquema remoto |

## Flujo de uso básico

1. **Registro**: un usuario se registra en `/registro` indicando nombre de tienda → queda como `owner` de una tienda nueva (trigger `handle_new_user` en la base de datos).
2. **Invitar empleados**: desde `/tienda-admin/<slug>/equipo` (solo `owner`), se genera un enlace de invitación (`/invitacion/<token>`); quien se registra desde ese enlace queda como `employee` de esa tienda, sin acceso a Reportes/Equipo/Configuración.
   - **Recuperar contraseña**: `/olvide-password` envía un enlace (sin revelar si el correo existe); el enlace resuelve en `/restablecer-password` para definir una nueva.
3. **Catálogo interno**: crear categorías, productos con imágenes y variantes (talla/color) en `/tienda-admin/<slug>/productos` y `/categorias`.
4. **Inventario**: ajustes manuales de stock en `/tienda-admin/<slug>/inventario`, con historial de movimientos inmutable.
5. **Catálogo público y pedidos**: `/tienda/<slug>` permite buscar/filtrar, agregar al carrito (persistido en `localStorage`) y enviar una solicitud de pedido, que se guarda en la base de datos y genera un enlace de WhatsApp prellenado hacia el número configurado en `/tienda-admin/<slug>/configuracion`.
6. **Ventas**: registrar una venta manual en `/tienda-admin/<slug>/ventas/nueva` descuenta stock atómicamente (función `register_sale`, con lock de fila e idempotencia por `client_request_id`).
7. **Dashboard y reportes**: el panel principal muestra ventas de 30 días, alertas de stock bajo y productos top; `/tienda-admin/<slug>/reportes` (solo `owner`) muestra ingresos totales, ticket promedio e histórico por día/producto.

## Seguridad y multi-tenencia

- Cada tienda está aislada por Row Level Security en Postgres; las policies usan helpers `is_store_member`/`is_store_owner` (`security definer stable`).
- El panel administrativo (`src/app/tienda-admin/[storeSlug]/layout.tsx`) es el único punto de guardia de sesión/rol para esa sección.
- `src/lib/supabase/admin.ts` (service_role) solo puede importarse desde Server Actions/route handlers, nunca desde componentes cliente.
- `register_sale` y `create_order_request` son `security definer` con validaciones explícitas de membership/pertenencia dentro de la función — no dependen únicamente de RLS.
- `sales`/`sale_items`/`stock_movements` son ledgers inmutables: sin policy de `UPDATE`/`DELETE`; las correcciones se hacen con nuevos movimientos de ajuste.
- `create_order_request` (abierta a `anon`) tiene límite de tasa: 5 solicitudes cada 10 minutos por IP+tienda, y 30 cada 10 minutos por tienda como respaldo si no hay IP disponible.

## SEO

`src/app/robots.ts` y `src/app/sitemap.ts` exponen `/robots.txt` y `/sitemap.xml`, permitiendo solo `/tienda/*` e indexando las tiendas activas y sus productos publicados. Cada tienda y producto público tiene `generateMetadata` propio (título/descripción/OG), útil para las previsualizaciones al compartir un enlace por WhatsApp.

## Pruebas

Alcance actual: Vitest sobre lógica pura (sin Supabase real ni E2E) — `tests/unit/`. Cubre `slugify`, `currency`, y la construcción del enlace de WhatsApp (`build-wa-link`).

```bash
npm test
```

Probar `register_sale` (locking/concurrencia) y las policies de RLS contra una base real requiere Supabase local vía Docker + pgTAP; queda fuera de alcance de esta fase y documentado como deuda técnica.

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/              # login, registro, invitación, callback
│   ├── (public)/tienda/     # catálogo público + carrito + checkout
│   └── tienda-admin/        # panel administrativo por tienda (requiere sesión)
├── actions/                 # Server Actions: única puerta de escritura para datos sensibles
├── lib/
│   ├── supabase/            # tres clientes: client (browser), server (RSC/actions), admin (service_role)
│   ├── auth/                # guardias de sesión/rol
│   ├── validations/         # esquemas Zod
│   └── whatsapp/, catalog/  # lógica de dominio
├── components/{ui,public}/
└── types/database.types.ts  # generado desde el esquema de Supabase
supabase/migrations/         # una migración por cambio de esquema, nunca editadas tras aplicarse
tests/unit/                  # Vitest, lógica pura
```
