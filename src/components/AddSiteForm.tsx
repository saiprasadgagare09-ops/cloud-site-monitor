import React, { useState } from "react";
import { Plus, Globe, Search } from "lucide-react";

interface AddSiteFormProps {
  onAdd: (url: string, keyword: string) => void;
}

export const AddSiteForm: React.FC<AddSiteFormProps> = ({ onAdd }) => {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onAdd(url, keyword);
    setUrl("");
    setKeyword("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
            <Globe size={18} />
          </div>
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent outline-none transition-all text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Keyword (optional)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent outline-none transition-all text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Add Monitor</span>
        </button>
      </div>
    </form>
  );
};
