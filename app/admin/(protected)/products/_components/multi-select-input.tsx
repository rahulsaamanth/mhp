import { useEffect, useRef, useState } from "react"
import { X, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { COMMON_TAGS } from "@/lib/constants"

type MultiSelectInputProps = {
  options: string[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  allowCustomTags?: boolean
}

export const MultiSelectInput = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Search tags...",
  allowCustomTags = true,
}: MultiSelectInputProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(value)
  const [searchTerm, setSearchTerm] = useState("")
  const [allOptions, setAllOptions] = useState<string[]>(options)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSelectedOptions(value)
  }, [value])

  const getFilteredOptions = () => {
    if (searchTerm) {
      return allOptions.filter((opt) =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    const commonTags = allOptions.filter((opt) => COMMON_TAGS.includes(opt))

    return commonTags.length > 0 ? commonTags : allOptions.slice(0, 12)
  }

  const filteredOptions = getFilteredOptions()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm && allowCustomTags) {
      e.preventDefault()

      if (!allOptions.includes(searchTerm)) {
        setAllOptions((prev) => [...prev, searchTerm])
      }

      if (!selectedOptions.includes(searchTerm)) {
        const newSelection = [...selectedOptions, searchTerm.toUpperCase()]
        setSelectedOptions(newSelection)
        onChange?.(newSelection)
      }

      setSearchTerm("")
      return
    }

    if (e.key === "Backspace" && !searchTerm && selectedOptions.length > 0) {
      const newSelection = selectedOptions.slice(0, -1)
      setSelectedOptions(newSelection)
      onChange?.(newSelection)
    }
  }

  const toggleOption = (option: string) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option]

    setSelectedOptions(newSelection)
    onChange?.(newSelection)
    inputRef.current?.focus()
  }

  const addCustomTag = () => {
    if (!searchTerm || selectedOptions.includes(searchTerm)) return

    if (!allOptions.includes(searchTerm)) {
      setAllOptions((prev) => [...prev, searchTerm])
    }

    const newSelection = [...selectedOptions, searchTerm]
    setSelectedOptions(newSelection)
    onChange?.(newSelection)
    setSearchTerm("")
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col min-h-[240px] space-y-4">
      <div
        className="min-h-[42px] w-full border rounded-lg bg-background p-2 flex flex-wrap gap-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedOptions.map((option, idx) => (
          <span
            key={idx}
            className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1 text-xs"
          >
            {option}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggleOption(option)
              }}
              className="hover:bg-primary/20 rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </span>
        ))}

        <div className="flex-1 relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search size={16} />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-8 pr-4 py-1 outline-none text-sm bg-transparent"
            placeholder={searchTerm ? placeholder : "Search or add new tags.."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {allowCustomTags && searchTerm && !allOptions.includes(searchTerm) && (
          <button
            type="button"
            onClick={addCustomTag}
            className="w-full mb-2 px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 bg-accent/50 hover:bg-accent"
          >
            <Plus size={16} />
            Add "{searchTerm}" as a new tag
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {filteredOptions.map((option, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                "px-1 py-1 text-xs rounded-md transition-colors",
                "border border-input hover:bg-accent",
                selectedOptions.includes(option) &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                !searchTerm && !COMMON_TAGS.includes(option) && "hidden"
              )}
            >
              {option}
            </button>
          ))}
          {filteredOptions.length === 0 && !searchTerm && (
            <p className="col-span-full text-center text-sm text-muted-foreground py-4">
              No matching tags found
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
