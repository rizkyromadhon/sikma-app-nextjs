import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function BreadcrumbHeader({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <Breadcrumb className="mb-6">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="flex items-center">
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href && !isLast ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbLink aria-current="page">{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        );
      })}
    </Breadcrumb>
  );
}
