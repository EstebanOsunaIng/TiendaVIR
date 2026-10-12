import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  PackageXIcon,
  PhoneIcon,
  ShoppingBagIcon,
  SparklesIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

export type Status =
  | "pending"
  | "contacted"
  | "confirmed"
  | "cancelled"
  | "sale"
  | "new"
  | "sold-out"
  | "low-stock"
  | "published"
  | "hidden"
  | "active"
  | "inactive";

const STATUS_CONFIG: Record<
  Status,
  { label: string; variant: VariantProps<typeof badgeVariants>["variant"]; icon: LucideIcon }
> = {
  pending: { label: "Pendiente", variant: "outline", icon: ClockIcon },
  contacted: { label: "Contactado", variant: "secondary", icon: PhoneIcon },
  confirmed: { label: "Confirmado", variant: "success", icon: CheckCircle2Icon },
  cancelled: { label: "Cancelado", variant: "destructive", icon: XCircleIcon },
  sale: { label: "Venta registrada", variant: "success", icon: ShoppingBagIcon },
  new: { label: "Nuevo", variant: "secondary", icon: SparklesIcon },
  "sold-out": { label: "Agotado", variant: "destructive", icon: PackageXIcon },
  "low-stock": { label: "Stock bajo", variant: "destructive", icon: AlertTriangleIcon },
  published: { label: "Publicado", variant: "success", icon: EyeIcon },
  hidden: { label: "Oculto", variant: "outline", icon: EyeOffIcon },
  active: { label: "Activa", variant: "success", icon: CircleIcon },
  inactive: { label: "Inactiva", variant: "outline", icon: CircleIcon },
};

export function StatusBadge({
  status,
  label,
}: {
  status: Status;
  /** Reemplaza la etiqueta por defecto (ej. para mostrar texto distinto en un idioma/contexto puntual). */
  label?: string;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant}>
      <Icon data-icon="inline-start" />
      {label ?? config.label}
    </Badge>
  );
}
