import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export function CompanyAutocomplete({ value, onChange }: CompanyAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    if (value.length >= 3) {
      fetchCompanies();
    }
  }, [value]);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('seo_analyses')
      .select('company')
      .ilike('company', `${value}%`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const uniqueCompanies = Array.from(new Set(data.map(item => item.company)));
      setCompanies(uniqueCompanies);
      setOpen(true);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            type="text"
            placeholder="Nom de l'entreprise"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-14 pl-6 text-lg rounded-full border-gray-200 focus-visible:ring-[#6366F1] bg-white shadow-sm w-full"
            required
            aria-required="true"
          />
        </PopoverTrigger>
        {companies.length > 0 && (
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {companies.map((companyName) => (
                    <CommandItem
                      key={companyName}
                      onSelect={() => {
                        onChange(companyName);
                        setOpen(false);
                      }}
                    >
                      {companyName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
      <p className="text-sm text-gray-500 ml-4">* Champ obligatoire</p>
    </div>
  );
}