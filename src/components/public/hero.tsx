import Image from "next/image";

export function Hero({
  storeName,
  description,
  coverImageUrl,
}: {
  storeName: string;
  description: string | null;
  coverImageUrl: string | null;
}) {
  if (coverImageUrl) {
    return (
      <section className="relative mb-8 flex h-64 items-end overflow-hidden rounded-2xl sm:h-80">
        <Image
          src={coverImageUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
        <div className="relative flex flex-col gap-1 p-6 text-background sm:p-8">
          <h1 className="font-heading text-3xl sm:text-4xl">{storeName}</h1>
          {description ? (
            <p className="max-w-lg text-sm text-background/90 sm:text-base">{description}</p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 flex flex-col gap-2 rounded-2xl bg-secondary px-6 py-10 sm:px-10 sm:py-14">
      <h1 className="font-heading text-3xl sm:text-4xl">{storeName}</h1>
      {description ? (
        <p className="max-w-lg text-sm text-muted-foreground sm:text-base">{description}</p>
      ) : null}
    </section>
  );
}
