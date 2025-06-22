import CreateRuanganForm from "./CreateRuanganForm";

export default function CreateRuanganPage() {
  return (
    <div className="w-full max-w-2xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tambah Ruangan Baru</h1>
      <CreateRuanganForm />
    </div>
  );
}
