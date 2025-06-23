import { Card } from "@/components/ui/card";

type JadwalCardProps = {
  matkul: string;
  dosen: string;
  ruangan: string;
  start: string;
  end: string;
  onClick?: () => void;
  className: string;
};

export default function JadwalCard({
  matkul,
  dosen,
  ruangan,
  start,
  end,
  onClick,
  className,
}: JadwalCardProps) {
  return (
    <Card
      className={`min-h-[80px] w-59 p-3 text-xs rounded-2xl bg-muted/30 text-foreground overflow-hidden ${className}`}
      onClick={onClick}
    >
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-3 rounded-2xl gap-2 cursor-pointer">
        <div className="font-semibold text-sm">{matkul}</div>
        <div className="text-sm text-neutral-800 dark:text-neutral-300">{dosen}</div>
        <div className="text-sm text-neutral-800 dark:text-neutral-300">{ruangan}</div>
        <div className="text-sm text-neutral-800 dark:text-neutral-300">
          {start} - {end}
        </div>
      </div>
    </Card>
  );
}
